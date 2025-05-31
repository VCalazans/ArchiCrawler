import { Injectable, Logger } from '@nestjs/common';
import { ValidationResult } from '../interfaces/test-generation.interface';
import { GeneratedTestResult, MCPCommand } from '../interfaces/llm-provider.interface';

@Injectable()
export class TestValidatorService {
  private readonly logger = new Logger(TestValidatorService.name);

  async validateGeneratedTest(generatedTest: GeneratedTestResult): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    try {
      // Validar estrutura básica
      this.validateBasicStructure(generatedTest, errors);
      
      // Validar comandos MCP
      this.validateMCPCommands(generatedTest.mcpCommands, errors, warnings);
      
      // Validar código do teste
      this.validateTestCode(generatedTest.testCode, errors, warnings);
      
      // Validar metadados
      this.validateMetadata(generatedTest.metadata, warnings);

      // Calcular score baseado em erros e warnings
      score = this.calculateScore(errors, warnings);

      this.logger.debug(`Validação concluída - Score: ${score}, Erros: ${errors.length}, Warnings: ${warnings.length}`);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        score
      };
    } catch (error) {
      this.logger.error(`Erro durante validação: ${error.message}`);
      return {
        isValid: false,
        errors: [`Erro interno de validação: ${error.message}`],
        warnings,
        score: 0
      };
    }
  }

  private validateBasicStructure(generatedTest: GeneratedTestResult, errors: string[]): void {
    if (!generatedTest.testCode || typeof generatedTest.testCode !== 'string') {
      errors.push('Código do teste é obrigatório e deve ser uma string');
    }

    if (!generatedTest.mcpCommands || !Array.isArray(generatedTest.mcpCommands)) {
      errors.push('Comandos MCP são obrigatórios e devem ser um array');
    }

    if (!generatedTest.metadata || typeof generatedTest.metadata !== 'object') {
      errors.push('Metadados são obrigatórios e devem ser um objeto');
    }
  }

  private validateMCPCommands(commands: MCPCommand[], errors: string[], warnings: string[]): void {
    if (!commands || commands.length === 0) {
      errors.push('Pelo menos um comando MCP é obrigatório');
      return;
    }

    const validActions = ['navigate', 'click', 'fill', 'screenshot', 'wait', 'assert', 'hover', 'select'];
    let hasNavigate = false;
    let hasScreenshot = false;

    commands.forEach((command, index) => {
      // Validar ação
      if (!command.action || !validActions.includes(command.action)) {
        errors.push(`Comando ${index + 1}: Ação inválida '${command.action}'. Ações válidas: ${validActions.join(', ')}`);
      }

      // Verificar comandos essenciais
      if (command.action === 'navigate') {
        hasNavigate = true;
        if (!command.url) {
          errors.push(`Comando ${index + 1}: Comando 'navigate' requer URL`);
        } else if (!this.isValidUrl(command.url)) {
          warnings.push(`Comando ${index + 1}: URL pode não ser válida: ${command.url}`);
        }
      }

      if (command.action === 'screenshot') {
        hasScreenshot = true;
        if (!command.name) {
          warnings.push(`Comando ${index + 1}: Screenshot sem nome definido`);
        }
      }

      // Validar seletores
      if (['click', 'fill', 'hover', 'select', 'wait'].includes(command.action)) {
        if (!command.selector) {
          errors.push(`Comando ${index + 1}: Comando '${command.action}' requer seletor`);
        } else if (!this.isValidSelector(command.selector)) {
          warnings.push(`Comando ${index + 1}: Seletor pode não ser robusto: ${command.selector}`);
        }
      }

      // Validar timeouts
      if (command.timeout && (command.timeout < 1000 || command.timeout > 60000)) {
        warnings.push(`Comando ${index + 1}: Timeout fora do range recomendado (1s-60s): ${command.timeout}ms`);
      }
    });

    // Verificar comandos essenciais
    if (!hasNavigate) {
      warnings.push('Teste não possui comando de navegação');
    }

    if (!hasScreenshot) {
      warnings.push('Teste não possui capturas de tela para evidência');
    }
  }

  private validateTestCode(testCode: string, errors: string[], warnings: string[]): void {
    if (!testCode || testCode.trim().length === 0) {
      errors.push('Código do teste não pode estar vazio');
      return;
    }

    // Verificar se contém comentários
    if (!testCode.includes('//') && !testCode.includes('/*')) {
      warnings.push('Código do teste não possui comentários explicativos');
    }

    // Verificar tamanho mínimo
    if (testCode.length < 50) {
      warnings.push('Código do teste muito curto, pode estar incompleto');
    }

    // Verificar se menciona MCP
    if (!testCode.toLowerCase().includes('mcp')) {
      warnings.push('Código do teste não menciona MCP');
    }
  }

  private validateMetadata(metadata: any, warnings: string[]): void {
    if (!metadata.confidence || metadata.confidence < 0 || metadata.confidence > 100) {
      warnings.push('Nível de confiança inválido ou ausente');
    }

    if (metadata.confidence && metadata.confidence < 70) {
      warnings.push(`Nível de confiança baixo: ${metadata.confidence}%`);
    }

    if (!metadata.description || metadata.description.length < 10) {
      warnings.push('Descrição do teste muito curta ou ausente');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidSelector(selector: string): boolean {
    // Verificar se é um seletor robusto (data-testid é preferível)
    if (selector.includes('[data-testid=') || selector.includes('[data-test=')) {
      return true;
    }

    // Seletores muito genéricos são menos robustos
    const genericSelectors = ['div', 'span', 'p', 'a', 'button'];
    const isGeneric = genericSelectors.some(tag => selector === tag);
    
    return !isGeneric;
  }

  private calculateScore(errors: string[], warnings: string[]): number {
    let score = 100;
    
    // Cada erro reduz 20 pontos
    score -= errors.length * 20;
    
    // Cada warning reduz 5 pontos
    score -= warnings.length * 5;
    
    // Score mínimo é 0
    return Math.max(0, score);
  }

  validateMCPCommandStructure(command: MCPCommand): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validActions = ['navigate', 'click', 'fill', 'screenshot', 'wait', 'assert', 'hover', 'select'];

    if (!command.action || !validActions.includes(command.action)) {
      errors.push(`Ação inválida: ${command.action}`);
    }

    // Validações específicas por tipo de comando
    switch (command.action) {
      case 'navigate':
        if (!command.url) {
          errors.push('Comando navigate requer URL');
        }
        break;
      
      case 'click':
      case 'fill':
      case 'hover':
      case 'select':
        if (!command.selector) {
          errors.push(`Comando ${command.action} requer seletor`);
        }
        break;
      
      case 'screenshot':
        if (!command.name) {
          errors.push('Comando screenshot requer nome');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 