"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TestFlowsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFlowsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const test_flow_entity_1 = require("../entities/test-flow.entity");
const test_execution_entity_1 = require("../entities/test-execution.entity");
let TestFlowsService = TestFlowsService_1 = class TestFlowsService {
    constructor(testFlowRepository, testExecutionRepository) {
        this.testFlowRepository = testFlowRepository;
        this.testExecutionRepository = testExecutionRepository;
        this.logger = new common_1.Logger(TestFlowsService_1.name);
    }
    async create(createTestFlowDto) {
        const testFlow = this.testFlowRepository.create(createTestFlowDto);
        return await this.testFlowRepository.save(testFlow);
    }
    async findAll(query) {
        const { page = 1, limit = 10, status, search, userId } = query;
        const skip = (page - 1) * limit;
        const queryBuilder = this.testFlowRepository.createQueryBuilder('testFlow');
        if (status) {
            queryBuilder.andWhere('testFlow.status = :status', { status });
        }
        if (search) {
            queryBuilder.andWhere('(testFlow.name LIKE :search OR testFlow.description LIKE :search)', { search: `%${search}%` });
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
    async findOne(id) {
        const testFlow = await this.testFlowRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!testFlow) {
            throw new common_1.NotFoundException(`TestFlow com ID ${id} não encontrado`);
        }
        return testFlow;
    }
    async update(id, updateTestFlowDto) {
        const testFlow = await this.findOne(id);
        Object.assign(testFlow, updateTestFlowDto);
        testFlow.updatedAt = new Date();
        return await this.testFlowRepository.save(testFlow);
    }
    async remove(id) {
        const testFlow = await this.findOne(id);
        await this.testFlowRepository.remove(testFlow);
    }
    async execute(id, userId) {
        const testFlow = await this.findOne(id);
        if (!testFlow.isActive) {
            throw new Error('TestFlow está inativo');
        }
        const execution = this.testExecutionRepository.create({
            testFlowId: id,
            userId,
            status: test_execution_entity_1.TestExecutionStatus.PENDING,
            totalSteps: testFlow.steps.length,
            completedSteps: 0,
            failedSteps: 0,
        });
        const savedExecution = await this.testExecutionRepository.save(execution);
        this.executeSteps(savedExecution.id, testFlow).catch((error) => {
            this.logger.error(`Erro na execução ${savedExecution.id}:`, error);
        });
        return savedExecution;
    }
    async executeSteps(executionId, testFlow) {
        const execution = await this.testExecutionRepository.findOne({
            where: { id: executionId },
        });
        if (!execution) {
            return;
        }
        try {
            execution.status = test_execution_entity_1.TestExecutionStatus.RUNNING;
            execution.startTime = new Date();
            await this.testExecutionRepository.save(execution);
            const executionSteps = [];
            let completedSteps = 0;
            let failedSteps = 0;
            for (const step of testFlow.steps) {
                const stepExecution = {
                    stepId: step.id,
                    status: test_execution_entity_1.TestExecutionStatus.RUNNING,
                    startTime: new Date(),
                };
                try {
                    this.logger.log(`Executando passo: ${step.name} (${step.type})`);
                    await this.executeStep(step);
                    stepExecution.status = test_execution_entity_1.TestExecutionStatus.SUCCESS;
                    stepExecution.endTime = new Date();
                    stepExecution.duration = stepExecution.endTime.getTime() - stepExecution.startTime.getTime();
                    completedSteps++;
                }
                catch (error) {
                    this.logger.error(`Erro no passo ${step.name}:`, error);
                    stepExecution.status = test_execution_entity_1.TestExecutionStatus.FAILED;
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
            execution.status = failedSteps === 0 ? test_execution_entity_1.TestExecutionStatus.SUCCESS : test_execution_entity_1.TestExecutionStatus.FAILED;
            execution.endTime = new Date();
            execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
            execution.completedSteps = completedSteps;
            execution.failedSteps = failedSteps;
            execution.steps = executionSteps;
            await this.testExecutionRepository.save(execution);
            testFlow.lastRun = new Date();
            await this.testFlowRepository.save(testFlow);
        }
        catch (error) {
            this.logger.error(`Erro geral na execução ${executionId}:`, error);
            execution.status = test_execution_entity_1.TestExecutionStatus.FAILED;
            execution.endTime = new Date();
            execution.error = error.message;
            execution.duration = execution.endTime.getTime() - (execution.startTime?.getTime() || 0);
            await this.testExecutionRepository.save(execution);
        }
    }
    async executeStep(step) {
        const { type, config } = step;
        this.logger.log(`Simulando execução do passo ${type} com config:`, config);
        await new Promise(resolve => setTimeout(resolve, 500));
        if (step.timeout) {
            await new Promise(resolve => setTimeout(resolve, step.timeout));
        }
    }
    async getExecutions(flowId) {
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
    async getExecution(id) {
        const execution = await this.testExecutionRepository.findOne({
            where: { id },
            relations: ['testFlow'],
        });
        if (!execution) {
            throw new common_1.NotFoundException(`Execução com ID ${id} não encontrada`);
        }
        return execution;
    }
};
exports.TestFlowsService = TestFlowsService;
exports.TestFlowsService = TestFlowsService = TestFlowsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(test_flow_entity_1.TestFlow)),
    __param(1, (0, typeorm_1.InjectRepository)(test_execution_entity_1.TestExecution)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TestFlowsService);
//# sourceMappingURL=test-flows.service.js.map