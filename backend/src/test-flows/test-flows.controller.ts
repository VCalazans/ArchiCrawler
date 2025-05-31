import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TestFlowsService } from './test-flows.service';
import { CreateTestFlowDto } from './dto/create-test-flow.dto';
import { UpdateTestFlowDto } from './dto/update-test-flow.dto';
import { QueryTestFlowDto } from './dto/query-test-flow.dto';
import { PlaywrightExecutorService } from './playwright-executor.service';

@Controller('test-flows')
export class TestFlowsController {
  constructor(
    private readonly testFlowsService: TestFlowsService,
    private readonly playwrightExecutor: PlaywrightExecutorService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTestFlowDto: CreateTestFlowDto) {
    // Se userId não for fornecido ou for vazio, usar o admin padrão
    if (!createTestFlowDto.userId || createTestFlowDto.userId.trim() === '') {
      createTestFlowDto.userId = '00000000-0000-0000-0000-000000000001'; // UUID do admin
    }
    
    const testFlow = await this.testFlowsService.create(createTestFlowDto);
    
    return {
      success: true,
      data: testFlow,
      message: 'TestFlow criado com sucesso',
    };
  }

  @Get()
  async findAll(@Query() query: QueryTestFlowDto) {
    const result = await this.testFlowsService.findAll(query);
    
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const testFlow = await this.testFlowsService.findOne(id);
    
    return {
      success: true,
      data: testFlow,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTestFlowDto: UpdateTestFlowDto,
  ) {
    const updatedFlow = await this.testFlowsService.update(id, updateTestFlowDto);
    
    return {
      success: true,
      data: updatedFlow,
      message: 'TestFlow atualizado com sucesso',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.testFlowsService.remove(id);
    
    return {
      success: true,
      message: 'TestFlow removido com sucesso',
    };
  }

  @Post(':id/execute')
  @HttpCode(HttpStatus.ACCEPTED)
  async execute(@Param('id') id: string) {
    const execution = await this.testFlowsService.execute(id, '00000000-0000-0000-0000-000000000001'); // UUID do admin
    
    return {
      success: true,
      data: execution,
      message: 'Execução iniciada com sucesso',
    };
  }

  @Get('playwright/status')
  async getPlaywrightStatus() {
    const isAvailable = await this.playwrightExecutor.isPlaywrightAvailable();
    
    return {
      success: true,
      data: {
        playwrightAvailable: isAvailable,
        executionMode: isAvailable ? 'real' : 'simulation',
        message: isAvailable 
          ? 'Playwright MCP está ativo - execuções reais disponíveis' 
          : 'Playwright MCP não está ativo - execuções em modo simulação'
      }
    };
  }

  @Get('debug/data')
  async getDebugData() {
    try {
      // Buscar alguns fluxos para debug
      const flows = await this.testFlowsService.findAll({ page: 1, limit: 3 });
      
      // Buscar execuções recentes
      const executions = await this.testFlowsService.getExecutions();
      
      return {
        success: true,
        data: {
          flows: flows.data.map(flow => ({
            id: flow.id,
            name: flow.name,
            stepsCount: flow.steps?.length || 0,
            steps: flow.steps || [],
            status: flow.status,
            isActive: flow.isActive
          })),
          executions: executions.data.slice(0, 3).map(exec => ({
            id: exec.id,
            testFlowId: exec.testFlowId,
            status: exec.status,
            totalSteps: exec.totalSteps,
            completedSteps: exec.completedSteps,
            failedSteps: exec.failedSteps,
            stepsDetails: exec.steps || [],
            duration: exec.duration
          }))
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Post('debug/test-execution')
  async testExecution() {
    try {
      console.log('🧪 Iniciando teste de execução completo...');
      
      // 1. Verificar status do Playwright
      const playwrightAvailable = await this.playwrightExecutor.isPlaywrightAvailable();
      console.log(`🎭 Playwright disponível: ${playwrightAvailable}`);
      
      // 2. Criar um fluxo de teste temporário
      const testFlowData = {
        name: `Teste Debug ${new Date().toISOString()}`,
        description: 'Fluxo criado automaticamente para teste de debug',
        userId: '00000000-0000-0000-0000-000000000001',
        isActive: true,
        status: 'draft' as any,
        steps: [
          {
            id: 'step-1',
            name: 'Navegar para Google',
            type: 'navigate' as const,
            config: { url: 'https://www.google.com' },
            timeout: 5000,
            continueOnError: false
          },
          {
            id: 'step-2', 
            name: 'Tirar Screenshot',
            type: 'screenshot' as const,
            config: { name: 'teste-debug' },
            timeout: 2000,
            continueOnError: true
          },
          {
            id: 'step-3',
            name: 'Extrair Título',
            type: 'extract' as const,
            config: { 
              selector: 'title',
              attribute: 'textContent'
            },
            timeout: 1000,
            continueOnError: true
          }
        ]
      };
      
      console.log(`📋 Criando fluxo de teste com ${testFlowData.steps.length} passos`);
      const testFlow = await this.testFlowsService.create(testFlowData);
      console.log(`✅ Fluxo criado: ${testFlow.id}`);
      
      // 3. Executar o fluxo
      console.log('🚀 Iniciando execução do fluxo de teste...');
      const execution = await this.testFlowsService.execute(testFlow.id, '00000000-0000-0000-0000-000000000001');
      console.log(`📦 Execução iniciada: ${execution.id}`);
      
      // 4. Aguardar um tempo para a execução
      console.log('⏳ Aguardando execução (10 segundos)...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // 5. Verificar resultado da execução
      const finalExecution = await this.testFlowsService.getExecution(execution.id);
      console.log(`🏁 Status final: ${finalExecution.status}`);
      console.log(`📊 Passos: ${finalExecution.completedSteps}/${finalExecution.totalSteps} (${finalExecution.failedSteps} falhas)`);
      console.log(`⏱️ Duração: ${finalExecution.duration}ms`);
      
      // 6. Analisar detalhes dos passos
      const stepResults = finalExecution.steps || [];
      console.log(`🔍 Analisando ${stepResults.length} passos executados:`);
      
      const stepAnalysis = stepResults.map(step => {
        console.log(`  - ${step.stepId}: ${step.status} (${step.duration}ms)`);
        if (step.error) {
          console.log(`    ❌ Erro: ${step.error}`);
        }
        
        return {
          stepId: step.stepId,
          status: step.status,
          duration: step.duration,
          success: step.status === 'success',
          error: step.error
        };
      });
      
      // 7. Limpar fluxo de teste
      console.log('🧹 Limpando fluxo de teste...');
      await this.testFlowsService.remove(testFlow.id);
      
      // 8. Compilar relatório final
      const successfulSteps = stepAnalysis.filter(s => s.success).length;
      const totalSteps = stepAnalysis.length;
      const executionWorking = finalExecution.status !== 'pending' && totalSteps > 0;
      
      const report = {
        timestamp: new Date().toISOString(),
        playwrightAvailable,
        executionMode: playwrightAvailable ? 'real' : 'simulation',
        testFlow: {
          id: testFlow.id,
          name: testFlow.name,
          stepsConfigured: testFlowData.steps.length
        },
        execution: {
          id: execution.id,
          status: finalExecution.status,
          totalSteps: finalExecution.totalSteps,
          completedSteps: finalExecution.completedSteps,
          failedSteps: finalExecution.failedSteps,
          duration: finalExecution.duration,
          working: executionWorking
        },
        steps: stepAnalysis,
        summary: {
          totalSteps,
          successfulSteps,
          successRate: totalSteps > 0 ? (successfulSteps / totalSteps * 100).toFixed(1) + '%' : '0%',
          executionWorking,
          playwrightIntegration: playwrightAvailable ? 'ATIVO' : 'INATIVO',
          overallStatus: executionWorking && successfulSteps > 0 ? 'SUCCESS' : 'FAILED'
        }
      };
      
      console.log('📄 RELATÓRIO FINAL:');
      console.log('=================');
      console.log(`Status Geral: ${report.summary.overallStatus}`);
      console.log(`Modo de Execução: ${report.executionMode}`);
      console.log(`Taxa de Sucesso: ${report.summary.successRate}`);
      console.log(`Execução Funcionando: ${report.execution.working}`);
      console.log(`Playwright Ativo: ${report.summary.playwrightIntegration}`);
      
      return {
        success: true,
        data: report,
        message: `Teste concluído: ${report.summary.overallStatus}`
      };
      
    } catch (error) {
      console.error('❌ Erro durante teste de execução:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        message: 'Falha no teste de execução'
      };
    }
  }
}

@Controller('test-executions')
export class TestExecutionsController {
  constructor(private readonly testFlowsService: TestFlowsService) {}

  @Get()
  async findAll(@Query('flowId') flowId?: string) {
    const result = await this.testFlowsService.getExecutions(flowId);
    
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const execution = await this.testFlowsService.getExecution(id);
    
    return {
      success: true,
      data: execution,
    };
  }
} 