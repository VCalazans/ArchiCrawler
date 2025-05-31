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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestGenerationController = void 0;
const common_1 = require("@nestjs/common");
const llm_test_generator_service_1 = require("../services/llm-test-generator.service");
const llm_test_execution_service_1 = require("../services/llm-test-execution.service");
const generate_test_dto_1 = require("../dto/generate-test.dto");
const test_execution_entity_1 = require("../../entities/test-execution.entity");
let TestGenerationController = class TestGenerationController {
    constructor(testGenerator, testExecution) {
        this.testGenerator = testGenerator;
        this.testExecution = testExecution;
        this.DEMO_USER_ID = '00000000-0000-4000-8000-000000000000';
    }
    getUserId(req) {
        return req.user?.id || this.DEMO_USER_ID;
    }
    async generateTest(dto, req) {
        const userId = this.getUserId(req);
        try {
            const request = {
                ...dto,
                userId
            };
            const generatedTest = await this.testGenerator.generateTest(request);
            return {
                success: true,
                message: 'Teste gerado com sucesso',
                data: {
                    id: generatedTest.id,
                    name: generatedTest.name,
                    status: generatedTest.status,
                    testType: generatedTest.testType,
                    targetUrl: generatedTest.targetUrl,
                    llmProvider: generatedTest.llmProvider,
                    model: generatedTest.model,
                    validationResult: generatedTest.validationResult,
                    metadata: generatedTest.metadata,
                    createdAt: generatedTest.createdAt
                }
            };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                success: false,
                message: error.message
            });
        }
    }
    async getTests(req, testType, status, llmProvider, limit) {
        const userId = this.getUserId(req);
        try {
            const filters = {
                testType,
                status,
                llmProvider,
                limit: limit ? parseInt(limit) : undefined
            };
            const tests = await this.testGenerator.getGeneratedTests(userId, filters);
            return {
                success: true,
                data: tests.map(test => ({
                    id: test.id,
                    name: test.name,
                    description: test.description,
                    status: test.status,
                    testType: test.testType,
                    targetUrl: test.targetUrl,
                    llmProvider: test.llmProvider,
                    model: test.model,
                    validationResult: test.validationResult,
                    metadata: test.metadata,
                    createdAt: test.createdAt,
                    updatedAt: test.updatedAt
                }))
            };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                success: false,
                message: error.message
            });
        }
    }
    async getStatistics(req) {
        const userId = this.getUserId(req);
        try {
            const stats = await this.testGenerator.getTestStatistics(userId);
            return {
                success: true,
                data: stats
            };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                success: false,
                message: error.message
            });
        }
    }
    async getTestById(id, req) {
        const userId = this.getUserId(req);
        try {
            const test = await this.testGenerator.getTestById(id, userId);
            return {
                success: true,
                data: {
                    id: test.id,
                    name: test.name,
                    description: test.description,
                    status: test.status,
                    testType: test.testType,
                    targetUrl: test.targetUrl,
                    llmProvider: test.llmProvider,
                    model: test.model,
                    originalPrompt: test.originalPrompt,
                    generatedCode: test.generatedCode,
                    mcpCommands: test.mcpCommands,
                    validationResult: test.validationResult,
                    executionHistory: test.executionHistory,
                    metadata: test.metadata,
                    createdAt: test.createdAt,
                    updatedAt: test.updatedAt
                }
            };
        }
        catch (error) {
            throw new common_1.NotFoundException({
                success: false,
                message: error.message
            });
        }
    }
    async updateTest(id, dto, req) {
        const userId = this.getUserId(req);
        try {
            if (dto.status) {
                const updatedTest = await this.testGenerator.updateTestStatus(id, userId, dto.status);
                return {
                    success: true,
                    message: 'Status do teste atualizado',
                    data: {
                        id: updatedTest.id,
                        status: updatedTest.status,
                        updatedAt: updatedTest.updatedAt
                    }
                };
            }
            throw new common_1.BadRequestException('Nenhuma atualização válida fornecida');
        }
        catch (error) {
            throw new common_1.BadRequestException({
                success: false,
                message: error.message
            });
        }
    }
    async regenerateTest(id, req) {
        const userId = this.getUserId(req);
        try {
            const newTest = await this.testGenerator.regenerateTest(id, userId);
            return {
                success: true,
                message: 'Teste regenerado com sucesso',
                data: {
                    originalId: id,
                    newId: newTest.id,
                    name: newTest.name,
                    status: newTest.status,
                    validationResult: newTest.validationResult,
                    metadata: newTest.metadata,
                    createdAt: newTest.createdAt
                }
            };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                success: false,
                message: error.message
            });
        }
    }
    async deleteTest(id, req) {
        const userId = this.getUserId(req);
        try {
            await this.testGenerator.deleteTest(id, userId);
            return {
                success: true,
                message: 'Teste removido com sucesso'
            };
        }
        catch (error) {
            throw new common_1.NotFoundException({
                success: false,
                message: error.message
            });
        }
    }
    async getMCPCommands(id, req) {
        const userId = this.getUserId(req);
        try {
            const test = await this.testGenerator.getTestById(id, userId);
            return {
                success: true,
                data: {
                    testId: test.id,
                    testName: test.name,
                    mcpCommands: test.mcpCommands,
                    commandCount: test.mcpCommands?.length || 0
                }
            };
        }
        catch (error) {
            throw new common_1.NotFoundException({
                success: false,
                message: error.message
            });
        }
    }
    async executeTest(id, req) {
        const userId = this.getUserId(req);
        try {
            const executionResult = await this.testExecution.executeTest(id, userId);
            return {
                success: true,
                message: 'Teste executado com sucesso',
                data: {
                    executionId: executionResult.id,
                    testId: id,
                    status: executionResult.status,
                    success: executionResult.status === test_execution_entity_1.TestExecutionStatus.SUCCESS,
                    duration: executionResult.duration,
                    totalSteps: executionResult.totalSteps,
                    completedSteps: executionResult.completedSteps,
                    failedSteps: executionResult.failedSteps,
                    startedAt: executionResult.startTime,
                    completedAt: executionResult.endTime
                }
            };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                success: false,
                message: `Erro ao executar teste: ${error.message}`
            });
        }
    }
    async getTestExecutions(id, req) {
        const userId = this.getUserId(req);
        try {
            const executions = await this.testExecution.getTestExecutions(id, userId);
            return {
                success: true,
                data: executions.map(execution => ({
                    id: execution.id,
                    testId: execution.testFlowId,
                    status: execution.status,
                    success: execution.status === test_execution_entity_1.TestExecutionStatus.SUCCESS,
                    duration: execution.duration,
                    totalSteps: execution.totalSteps,
                    completedSteps: execution.completedSteps,
                    failedSteps: execution.failedSteps,
                    startedAt: execution.startTime,
                    completedAt: execution.endTime
                }))
            };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                success: false,
                message: error.message
            });
        }
    }
    async getExecutionDetails(executionId, req) {
        const userId = this.getUserId(req);
        try {
            const execution = await this.testExecution.getExecutionResult(executionId, userId);
            return {
                success: true,
                data: {
                    id: execution.id,
                    testId: execution.testFlowId,
                    status: execution.status,
                    success: execution.status === test_execution_entity_1.TestExecutionStatus.SUCCESS,
                    duration: execution.duration,
                    totalSteps: execution.totalSteps,
                    completedSteps: execution.completedSteps,
                    failedSteps: execution.failedSteps,
                    steps: execution.steps,
                    error: execution.error,
                    startedAt: execution.startTime,
                    completedAt: execution.endTime
                }
            };
        }
        catch (error) {
            throw new common_1.NotFoundException({
                success: false,
                message: error.message
            });
        }
    }
    async stopExecution(executionId, req) {
        const userId = this.getUserId(req);
        try {
            await this.testExecution.stopExecution(executionId, userId);
            return {
                success: true,
                message: 'Execução interrompida com sucesso'
            };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                success: false,
                message: error.message
            });
        }
    }
};
exports.TestGenerationController = TestGenerationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_test_dto_1.GenerateTestDto, Object]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "generateTest", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('testType')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('llmProvider')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "getTests", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "getTestById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generate_test_dto_1.UpdateTestDto, Object]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "updateTest", null);
__decorate([
    (0, common_1.Post)(':id/regenerate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "regenerateTest", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "deleteTest", null);
__decorate([
    (0, common_1.Get)(':id/mcp-commands'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "getMCPCommands", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "executeTest", null);
__decorate([
    (0, common_1.Get)(':id/executions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "getTestExecutions", null);
__decorate([
    (0, common_1.Get)('executions/:executionId'),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "getExecutionDetails", null);
__decorate([
    (0, common_1.Post)('executions/:executionId/stop'),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestGenerationController.prototype, "stopExecution", null);
exports.TestGenerationController = TestGenerationController = __decorate([
    (0, common_1.Controller)('llm-tests/generate'),
    __metadata("design:paramtypes", [llm_test_generator_service_1.LLMTestGeneratorService,
        llm_test_execution_service_1.LLMTestExecutionService])
], TestGenerationController);
//# sourceMappingURL=test-generation.controller.js.map