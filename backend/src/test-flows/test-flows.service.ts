import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { TestFlow } from '../entities/test-flow.entity';
import { TestExecution, TestExecutionStatus, ExecutionStep } from '../entities/test-execution.entity';
import { CreateTestFlowDto } from './dto/create-test-flow.dto';
import { UpdateTestFlowDto } from './dto/update-test-flow.dto';
import { QueryTestFlowDto } from './dto/query-test-flow.dto';

@Injectable()
export class TestFlowsService {
  private readonly logger = new Logger(TestFlowsService.name);

  constructor(
    @InjectRepository(TestFlow)
    private testFlowRepository: Repository<TestFlow>,
    @InjectRepository(TestExecution)
    private testExecutionRepository: Repository<TestExecution>,
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
    
    if (!testFlow.isActive) {
      throw new Error('TestFlow está inativo');
    }

    // Criar uma nova execução
    const execution = this.testExecutionRepository.create({
      testFlowId: id,
      userId,
      status: TestExecutionStatus.PENDING,
      totalSteps: testFlow.steps.length,
      completedSteps: 0,
      failedSteps: 0,
    });

    const savedExecution = await this.testExecutionRepository.save(execution);

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
      return;
    }

    try {
      execution.status = TestExecutionStatus.RUNNING;
      execution.startTime = new Date();
      await this.testExecutionRepository.save(execution);

      const executionSteps: ExecutionStep[] = [];
      let completedSteps = 0;
      let failedSteps = 0;

      for (const step of testFlow.steps) {
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
          
        } catch (error) {
          this.logger.error(`Erro no passo ${step.name}:`, error);
          stepExecution.status = TestExecutionStatus.FAILED;
          stepExecution.error = error.message;
          stepExecution.endTime = new Date();
          stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime.getTime();
          failedSteps++;

          if (!step.continueOnError) {
            executionSteps.push(stepExecution);
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

    // Implementação básica dos passos de teste
    // TODO: Integrar com MCP Service para execução real via Playwright
    
    this.logger.log(`Simulando execução do passo ${type} com config:`, config);
    
    // Simular tempo de execução
    await new Promise(resolve => setTimeout(resolve, 500));

    // Aguardar timeout se especificado
    if (step.timeout) {
      await new Promise(resolve => setTimeout(resolve, step.timeout));
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