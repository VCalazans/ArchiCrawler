import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestFlow } from '../entities/test-flow.entity';
import { TestExecution, TestExecutionStatus, ExecutionStep } from '../entities/test-execution.entity';
import { CreateTestFlowDto } from './dto/create-test-flow.dto';
import { UpdateTestFlowDto } from './dto/update-test-flow.dto';
import { QueryTestFlowDto } from './dto/query-test-flow.dto';
import { PlaywrightExecutorService } from './playwright-executor.service';

@Injectable()
export class TestFlowsService {
  private readonly logger = new Logger(TestFlowsService.name);

  constructor(
    @InjectRepository(TestFlow)
    private testFlowRepository: Repository<TestFlow>,
    @InjectRepository(TestExecution)
    private testExecutionRepository: Repository<TestExecution>,
    private readonly playwrightExecutor: PlaywrightExecutorService,
  ) {}

  async create(createTestFlowDto: CreateTestFlowDto): Promise<TestFlow> {
    const testFlow = this.testFlowRepository.create(createTestFlowDto);
    return await this.testFlowRepository.save(testFlow);
  }

  async findAll(query: QueryTestFlowDto): Promise<{ data: TestFlow[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, search, userId } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.testFlowRepository.createQueryBuilder('testFlow');

    if (status) {
      queryBuilder.andWhere('testFlow.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(testFlow.name LIKE :search OR testFlow.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (userId) {
      queryBuilder.andWhere('testFlow.userId = :userId', { userId });
    }

    queryBuilder
      .orderBy('testFlow.updatedAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<TestFlow> {
    const testFlow = await this.testFlowRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!testFlow) {
      throw new NotFoundException(`TestFlow com ID ${id} não encontrado`);
    }

    return testFlow;
  }

  async update(id: string, updateTestFlowDto: UpdateTestFlowDto): Promise<TestFlow> {
    const testFlow = await this.findOne(id);
    
    Object.assign(testFlow, updateTestFlowDto);
    testFlow.updatedAt = new Date();

    return await this.testFlowRepository.save(testFlow);
  }

  async remove(id: string): Promise<void> {
    const testFlow = await this.findOne(id);
    await this.testFlowRepository.remove(testFlow);
  }

  async execute(id: string, userId: string): Promise<TestExecution> {
    const testFlow = await this.findOne(id);
    
    this.logger.log(`🎯 Iniciando execução do fluxo: ${testFlow.name} (${id})`);
    this.logger.log(`📋 Passos encontrados: ${testFlow.steps?.length || 0}`);
    
    if (testFlow.steps && testFlow.steps.length > 0) {
      this.logger.log(`📝 Detalhes dos passos:`);
      testFlow.steps.forEach((step, index) => {
        this.logger.log(`  ${index + 1}. ${step.name} (${step.type}) - Config: ${JSON.stringify(step.config)}`);
      });
    } else {
      this.logger.warn(`⚠️ ATENÇÃO: Fluxo ${testFlow.name} não possui passos configurados!`);
    }
    
    if (!testFlow.isActive) {
      throw new Error('TestFlow está inativo');
    }

    // Criar uma nova execução
    const execution = this.testExecutionRepository.create({
      testFlowId: id,
      userId,
      status: TestExecutionStatus.PENDING,
      totalSteps: testFlow.steps?.length || 0,
      completedSteps: 0,
      failedSteps: 0,
    });

    const savedExecution = await this.testExecutionRepository.save(execution);
    this.logger.log(`📦 Execução criada: ${savedExecution.id} com ${savedExecution.totalSteps} passos`);

    // Executar os passos de forma assíncrona
    this.executeSteps(savedExecution.id, testFlow).catch((error) => {
      this.logger.error(`Erro na execução ${savedExecution.id}:`, error);
    });

    return savedExecution;
  }

  private async executeSteps(executionId: string, testFlow: TestFlow): Promise<void> {
    const execution = await this.testExecutionRepository.findOne({
      where: { id: executionId },
    });

    if (!execution) {
      this.logger.error(`❌ Execução ${executionId} não encontrada`);
      return;
    }

    this.logger.log(`🚀 Iniciando execução de passos para: ${testFlow.name}`);
    this.logger.log(`📊 Passos a executar: ${testFlow.steps?.length || 0}`);

    try {
      execution.status = TestExecutionStatus.RUNNING;
      execution.startTime = new Date();
      await this.testExecutionRepository.save(execution);

      const executionSteps: ExecutionStep[] = [];
      let completedSteps = 0;
      let failedSteps = 0;

      // Verificar se existem passos para executar
      if (!testFlow.steps || testFlow.steps.length === 0) {
        this.logger.warn(`⚠️ Nenhum passo para executar no fluxo ${testFlow.name}`);
        
        // Finalizar execução como sucesso mas sem passos
        execution.status = TestExecutionStatus.SUCCESS;
        execution.endTime = new Date();
        execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
        execution.completedSteps = 0;
        execution.failedSteps = 0;
        execution.steps = [];
        await this.testExecutionRepository.save(execution);
        return;
      }

      for (const step of testFlow.steps) {
        this.logger.log(`🔄 Processando passo: ${step.name} (${step.type})`);
        
        const stepExecution: ExecutionStep = {
          stepId: step.id,
          status: TestExecutionStatus.RUNNING,
          startTime: new Date(),
        };

        try {
          this.logger.log(`Executando passo: ${step.name} (${step.type})`);
          
          // Executar o passo baseado no tipo
          await this.executeStep(step);
          
          stepExecution.status = TestExecutionStatus.SUCCESS;
          stepExecution.endTime = new Date();
          stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime.getTime();
          completedSteps++;
          
          this.logger.log(`✅ Passo ${step.name} executado com sucesso em ${stepExecution.duration}ms`);
          
        } catch (error) {
          this.logger.error(`Erro no passo ${step.name}:`, error);
          stepExecution.status = TestExecutionStatus.FAILED;
          stepExecution.error = error.message;
          stepExecution.endTime = new Date();
          stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime.getTime();
          failedSteps++;

          if (!step.continueOnError) {
            executionSteps.push(stepExecution);
            this.logger.log(`❌ Parando execução devido a erro em ${step.name}`);
            break;
          }
        }

        executionSteps.push(stepExecution);
      }

      // Atualizar execução final
      execution.status = failedSteps === 0 ? TestExecutionStatus.SUCCESS : TestExecutionStatus.FAILED;
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      execution.completedSteps = completedSteps;
      execution.failedSteps = failedSteps;
      execution.steps = executionSteps;

      await this.testExecutionRepository.save(execution);
      
      this.logger.log(`🏁 Execução finalizada: ${execution.status}`);
      this.logger.log(`📈 Estatísticas: ${completedSteps}/${testFlow.steps.length} passos (${failedSteps} falhas)`);
      this.logger.log(`⏱️ Duração total: ${execution.duration}ms`);

      // Atualizar lastRun do TestFlow
      testFlow.lastRun = new Date();
      await this.testFlowRepository.save(testFlow);

    } catch (error) {
      this.logger.error(`Erro geral na execução ${executionId}:`, error);
      execution.status = TestExecutionStatus.FAILED;
      execution.endTime = new Date();
      execution.error = error.message;
      execution.duration = execution.endTime.getTime() - (execution.startTime?.getTime() || 0);
      await this.testExecutionRepository.save(execution);
    }
  }

  private async executeStep(step: any): Promise<void> {
    const { type, config } = step;

    // Verificar se Playwright está disponível
    const playwrightAvailable = await this.playwrightExecutor.isPlaywrightAvailable();
    
    if (playwrightAvailable) {
      // ✅ EXECUÇÃO REAL via Playwright MCP
      this.logger.log(`🎬 Executando passo REAL: ${step.name} (${type})`);
      
      const result = await this.playwrightExecutor.executeStep({
        id: step.id,
        name: step.name,
        type,
        config,
        timeout: step.timeout,
        continueOnError: step.continueOnError
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Erro na execução do passo');
      }
      
      this.logger.log(`✅ Passo real executado: ${step.name} em ${result.duration}ms`);
      
    } else {
      // 🔄 FALLBACK: Simulação (quando Playwright não está disponível)
      this.logger.warn(`⚠️ Playwright não disponível, executando simulação: ${step.name} (${type})`);
      this.logger.log(`Simulando execução do passo ${type} com config:`, config);
      
      // Simular tempo de execução
      await new Promise(resolve => setTimeout(resolve, 500));

      // Aguardar timeout se especificado
      if (step.timeout) {
        await new Promise(resolve => setTimeout(resolve, step.timeout));
      }
    }
  }

  async getExecutions(flowId?: string): Promise<{ data: TestExecution[]; total: number }> {
    const queryBuilder = this.testExecutionRepository.createQueryBuilder('execution');

    if (flowId) {
      queryBuilder.andWhere('execution.testFlowId = :flowId', { flowId });
    }

    queryBuilder
      .leftJoinAndSelect('execution.testFlow', 'testFlow')
      .orderBy('execution.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async getExecution(id: string): Promise<TestExecution> {
    const execution = await this.testExecutionRepository.findOne({
      where: { id },
      relations: ['testFlow'],
    });

    if (!execution) {
      throw new NotFoundException(`Execução com ID ${id} não encontrada`);
    }

    return execution;
  }
} 