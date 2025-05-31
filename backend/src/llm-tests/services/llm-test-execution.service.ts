import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneratedTest } from '../entities/generated-test.entity';
import { TestExecution, TestExecutionStatus, ExecutionStep } from '../../entities/test-execution.entity';
import { MCPCommand } from '../interfaces/llm-provider.interface';
import { PlaywrightMCPService } from '../../mcp/services/playwright-mcp.service';

@Injectable()
export class LLMTestExecutionService {
  private readonly logger = new Logger(LLMTestExecutionService.name);

  constructor(
    @InjectRepository(GeneratedTest)
    private readonly generatedTestRepository: Repository<GeneratedTest>,
    @InjectRepository(TestExecution)
    private readonly executionRepository: Repository<TestExecution>,
    private readonly playwrightMCPService: PlaywrightMCPService,
  ) {}

  /**
   * Executa um teste LLM convertendo-o para comandos MCP
   */
  async executeTest(testId: string, userId: string): Promise<TestExecution> {
    this.logger.log(`Iniciando execução do teste LLM ${testId} para usuário ${userId}`);

    // 1. Buscar o teste gerado
    const test = await this.generatedTestRepository.findOne({
      // Temporariamente sem filtro userId
      where: { id: testId },
    });

    if (!test) {
      throw new NotFoundException('Teste não encontrado');
    }

    // 2. Converter teste LLM para comandos MCP
    const mcpCommands = this.convertLLMTestToMCPCommands(test);
    this.logger.debug(`Convertido para ${mcpCommands.length} comandos MCP`);

    // 3. Criar registro de execução usando a entidade existente
    const execution = this.executionRepository.create({
      testFlowId: testId, // Usando testId como testFlowId para compatibilidade
      userId,
      status: TestExecutionStatus.RUNNING,
      startTime: new Date(),
      totalSteps: mcpCommands.length,
      completedSteps: 0,
      failedSteps: 0,
      steps: [],
    });

    const savedExecution = await this.executionRepository.save(execution);

    try {
      const executionSteps: ExecutionStep[] = [];
      let hasErrors = false;

      // 4. Executar comandos MCP sequencialmente
      for (let i = 0; i < mcpCommands.length; i++) {
        const command = mcpCommands[i];
        const stepId = `step-${i + 1}`;
        
        const step: ExecutionStep = {
          stepId,
          status: TestExecutionStatus.RUNNING,
          startTime: new Date(),
        };

        try {
          const result = await this.executeMCPCommand(command);
          
          step.endTime = new Date();
          step.duration = step.endTime.getTime() - step.startTime.getTime();
          step.status = TestExecutionStatus.SUCCESS;
          step.result = {
            action: command.action,
            description: command.description,
            data: result.data,
            duration: result.duration
          };

          // Capturar screenshot se necessário
          if (command.captureScreenshot) {
            const screenshot = await this.captureScreenshot();
            if (screenshot) {
              step.screenshot = screenshot;
            }
          }

          savedExecution.completedSteps += 1;
          
        } catch (error) {
          hasErrors = true;
          step.endTime = new Date();
          step.duration = step.endTime.getTime() - step.startTime.getTime();
          step.status = TestExecutionStatus.FAILED;
          step.error = error.message;
          
          savedExecution.failedSteps += 1;
          
          this.logger.error(`Erro ao executar comando MCP ${command.action}: ${error.message}`);
          
          // Capturar screenshot do erro
          try {
            const errorScreenshot = await this.captureScreenshot();
            if (errorScreenshot) {
              step.screenshot = errorScreenshot;
            }
          } catch (screenshotError) {
            this.logger.warn(`Não foi possível capturar screenshot do erro: ${screenshotError.message}`);
          }
        }

        executionSteps.push(step);
      }

      // 5. Atualizar execução final
      savedExecution.endTime = new Date();
      savedExecution.duration = savedExecution.endTime.getTime() - savedExecution.startTime.getTime();
      savedExecution.status = hasErrors ? TestExecutionStatus.FAILED : TestExecutionStatus.SUCCESS;
      savedExecution.steps = executionSteps;

      // 6. Atualizar o teste com informações da execução
      test.lastExecutionAt = new Date();
      test.executionCount = (test.executionCount || 0) + 1;
      if (!hasErrors) {
        test.lastSuccessfulExecutionAt = new Date();
      }

      await Promise.all([
        this.executionRepository.save(savedExecution),
        this.generatedTestRepository.save(test),
      ]);

      this.logger.log(`Execução do teste LLM ${testId} finalizada: ${savedExecution.status}`);
      return savedExecution;

    } catch (error) {
      // Atualizar em caso de erro geral
      savedExecution.endTime = new Date();
      savedExecution.duration = savedExecution.endTime.getTime() - savedExecution.startTime.getTime();
      savedExecution.status = TestExecutionStatus.FAILED;
      savedExecution.error = `Erro geral na execução: ${error.message}`;

      await this.executionRepository.save(savedExecution);
      
      this.logger.error(`Erro na execução do teste LLM ${testId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Converte um teste LLM para comandos MCP executáveis
   */
  private convertLLMTestToMCPCommands(test: GeneratedTest): MCPCommand[] {
    const commands: MCPCommand[] = [];

    try {
      // Limpar comentários JavaScript e whitespace do generatedCode
      let cleanedCode = test.generatedCode;
      
      // Remover comentários de linha única (// ...)
      cleanedCode = cleanedCode.replace(/\/\/.*$/gm, '');
      
      // Remover comentários multi-linha (/* ... */)
      cleanedCode = cleanedCode.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remover whitespace extra
      cleanedCode = cleanedCode.trim();
      
      // Se não começar com { ou [, pode ser código JavaScript, extrair JSON
      if (!cleanedCode.startsWith('{') && !cleanedCode.startsWith('[')) {
        // Procurar por JSON válido no código
        const jsonMatch = cleanedCode.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedCode = jsonMatch[0];
        } else {
          // Se não houver JSON, tentar extrair comandos do código JavaScript
          return this.parseJavaScriptCommands(test);
        }
      }

      this.logger.debug(`Código limpo para parsing: ${cleanedCode.substring(0, 200)}...`);
      
      // Parse do JSON do teste gerado
      const testData = JSON.parse(cleanedCode);
      
      // Comando inicial: navegar para a URL
      commands.push({
        action: 'navigate',
        url: test.targetUrl,
        description: `Navegar para ${test.targetUrl}`,
        captureScreenshot: true,
      });

      // Processar comandos MCP do teste gerado
      if (testData.mcpCommands && Array.isArray(testData.mcpCommands)) {
        for (const cmd of testData.mcpCommands) {
          commands.push({
            action: cmd.action || 'unknown',
            selector: cmd.selector,
            value: cmd.value,
            url: cmd.url,
            description: cmd.description || `${cmd.action} ${cmd.selector || ''}`.trim(),
            waitFor: cmd.waitFor,
            timeout: cmd.timeout || 5000,
            captureScreenshot: ['click', 'navigate', 'submit'].includes(cmd.action),
          });
        }
      } else {
        // Fallback: criar comandos básicos baseados no tipo de teste
        this.logger.warn(`Teste ${test.id} não possui comandos MCP válidos, criando comandos básicos`);
        
        commands.push({
          action: 'screenshot',
          description: 'Capturar screenshot da página inicial',
          captureScreenshot: true,
        });

        if (test.testType === 'e2e') {
          commands.push({
            action: 'wait',
            value: '2000',
            description: 'Aguardar carregamento da página',
          });
        }
      }

      // Comando final: screenshot do resultado
      commands.push({
        action: 'screenshot',
        description: 'Screenshot final do teste',
        captureScreenshot: true,
      });

      this.logger.debug(`Convertido para ${commands.length} comandos MCP`);
      return commands;

    } catch (error) {
      this.logger.error(`Erro ao converter teste LLM para comandos MCP: ${error.message}`);
      this.logger.debug(`Código original problemático: ${test.generatedCode.substring(0, 500)}...`);
      
      // Tentar extrair comandos do código JavaScript como último recurso
      return this.parseJavaScriptCommands(test);
    }
  }

  /**
   * Extrai comandos MCP de código JavaScript antigo
   */
  private parseJavaScriptCommands(test: GeneratedTest): MCPCommand[] {
    const commands: MCPCommand[] = [];
    
    try {
      // Comando inicial: navegar para a URL
      commands.push({
        action: 'navigate',
        url: test.targetUrl,
        description: `Navegar para ${test.targetUrl}`,
        captureScreenshot: true,
      });

      const lines = test.generatedCode.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Ignorar comentários e linhas vazias
        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
          continue;
        }

        // Extrair comandos comuns
        if (trimmedLine.includes("navigate(")) {
          const urlMatch = trimmedLine.match(/navigate\(['"`]([^'"`]+)['"`]/);
          if (urlMatch) {
            commands.push({
              action: 'navigate',
              url: urlMatch[1],
              description: `Navegar para ${urlMatch[1]}`,
              captureScreenshot: true,
            });
          }
        } else if (trimmedLine.includes("click(")) {
          const selectorMatch = trimmedLine.match(/click\(['"`]([^'"`]+)['"`]/);
          if (selectorMatch) {
            commands.push({
              action: 'click',
              selector: selectorMatch[1],
              description: `Clicar em ${selectorMatch[1]}`,
              captureScreenshot: true,
            });
          }
        } else if (trimmedLine.includes("fill(")) {
          const fillMatch = trimmedLine.match(/fill\(['"`]([^'"`]+)['"`],\s*['"`]([^'"`]*)['"`]/);
          if (fillMatch) {
            commands.push({
              action: 'fill',
              selector: fillMatch[1],
              value: fillMatch[2],
              description: `Preencher ${fillMatch[1]} com ${fillMatch[2]}`,
            });
          }
        } else if (trimmedLine.includes("screenshot(")) {
          const nameMatch = trimmedLine.match(/screenshot\(['"`]([^'"`]+)['"`]/);
          commands.push({
            action: 'screenshot',
            name: nameMatch ? nameMatch[1] : 'screenshot',
            description: `Capturar screenshot`,
            captureScreenshot: true,
          });
        } else if (trimmedLine.includes("wait(")) {
          const waitMatch = trimmedLine.match(/wait\((?:['"`]([^'"`]+)['"`]|(\d+))/);
          if (waitMatch) {
            const waitValue = waitMatch[2] || '2000'; // Default 2 segundos
            commands.push({
              action: 'wait',
              value: waitValue,
              description: `Aguardar ${waitValue}ms`,
            });
          }
        }
      }

      // Se não conseguiu extrair nenhum comando, adicionar básicos
      if (commands.length === 1) { // Só o navigate inicial
        commands.push({
          action: 'screenshot',
          description: 'Screenshot da página',
          captureScreenshot: true,
        });
      }

      this.logger.debug(`Extraído ${commands.length} comandos de código JavaScript antigo`);
      return commands;

    } catch (error) {
      this.logger.error(`Erro ao extrair comandos JavaScript: ${error.message}`);
      
      // Comandos básicos de emergência
      return [
        {
          action: 'navigate',
          url: test.targetUrl,
          description: `Navegar para ${test.targetUrl}`,
          captureScreenshot: true,
        },
        {
          action: 'screenshot',
          description: 'Screenshot básico',
          captureScreenshot: true,
        },
      ];
    }
  }

  /**
   * Executa um comando MCP individual
   */
  private async executeMCPCommand(command: MCPCommand): Promise<{ duration: number; data?: any }> {
    const startTime = Date.now();
    
    try {
      let result;

      switch (command.action) {
        case 'navigate':
          result = await this.playwrightMCPService.navigate(command.url, {
            timeout: command.timeout
          });
          break;
          
        case 'click':
          result = await this.playwrightMCPService.click(command.selector, {
            timeout: command.timeout
          });
          break;
          
        case 'fill':
          result = await this.playwrightMCPService.fill(command.selector, command.value, {
            timeout: command.timeout
          });
          break;
          
        case 'wait':
          const waitTime = parseInt(command.value) || 1000;
          result = await this.playwrightMCPService.wait(waitTime);
          break;
          
        case 'screenshot':
          result = await this.playwrightMCPService.screenshot(command.name, {
            fullPage: command.fullPage
          });
          break;
          
        case 'hover':
          result = await this.playwrightMCPService.hover(command.selector, {
            timeout: command.timeout
          });
          break;
          
        case 'select':
          result = await this.playwrightMCPService.select(command.selector, command.value, {
            timeout: command.timeout
          });
          break;

        case 'press_key':
          result = await this.playwrightMCPService.pressKey(command.key, command.selector);
          break;

        case 'get_text':
          result = await this.playwrightMCPService.getVisibleText();
          break;

        case 'evaluate':
          result = await this.playwrightMCPService.evaluate(command.script);
          break;
          
        default:
          throw new Error(`Ação MCP não suportada: ${command.action}`);
      }

      const duration = Date.now() - startTime;
      return { duration, data: result };

    } catch (error) {
      const duration = Date.now() - startTime;
      throw new Error(`Falha no comando ${command.action}: ${error.message}`);
    }
  }

  /**
   * Captura um screenshot da página atual
   */
  private async captureScreenshot(): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = `llm-test-${timestamp}`;
      
      const result = await this.playwrightMCPService.screenshot(screenshotName);
      return result?.path || screenshotName;
    } catch (error) {
      this.logger.warn(`Não foi possível capturar screenshot: ${error.message}`);
      return null;
    }
  }

  /**
   * Busca resultados de execução de um teste
   */
  async getTestExecutions(testId: string, userId: string): Promise<TestExecution[]> {
    return this.executionRepository.find({
      where: { testFlowId: testId, userId },
      order: { startTime: 'DESC' },
    });
  }

  /**
   * Busca uma execução específica
   */
  async getExecutionResult(executionId: string, userId: string): Promise<TestExecution> {
    const execution = await this.executionRepository.findOne({
      where: { id: executionId, userId },
    });

    if (!execution) {
      throw new NotFoundException('Execução não encontrada');
    }

    return execution;
  }

  /**
   * Para uma execução em andamento
   */
  async stopExecution(executionId: string, userId: string): Promise<void> {
    const execution = await this.getExecutionResult(executionId, userId);
    
    if (execution.status === TestExecutionStatus.RUNNING) {
      execution.status = TestExecutionStatus.CANCELLED;
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      execution.error = 'Execução interrompida pelo usuário';

      await this.executionRepository.save(execution);
      this.logger.log(`Execução ${executionId} interrompida pelo usuário ${userId}`);
    }
  }
} 