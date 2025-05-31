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
exports.TestExecutionsController = exports.TestFlowsController = void 0;
const common_1 = require("@nestjs/common");
const test_flows_service_1 = require("./test-flows.service");
const create_test_flow_dto_1 = require("./dto/create-test-flow.dto");
const update_test_flow_dto_1 = require("./dto/update-test-flow.dto");
const query_test_flow_dto_1 = require("./dto/query-test-flow.dto");
const playwright_executor_service_1 = require("./playwright-executor.service");
let TestFlowsController = class TestFlowsController {
    constructor(testFlowsService, playwrightExecutor) {
        this.testFlowsService = testFlowsService;
        this.playwrightExecutor = playwrightExecutor;
    }
    async create(createTestFlowDto) {
        if (!createTestFlowDto.userId || createTestFlowDto.userId.trim() === '') {
            createTestFlowDto.userId = '00000000-0000-0000-0000-000000000001';
        }
        const testFlow = await this.testFlowsService.create(createTestFlowDto);
        return {
            success: true,
            data: testFlow,
            message: 'TestFlow criado com sucesso',
        };
    }
    async findAll(query) {
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
    async findOne(id) {
        const testFlow = await this.testFlowsService.findOne(id);
        return {
            success: true,
            data: testFlow,
        };
    }
    async update(id, updateTestFlowDto) {
        const updatedFlow = await this.testFlowsService.update(id, updateTestFlowDto);
        return {
            success: true,
            data: updatedFlow,
            message: 'TestFlow atualizado com sucesso',
        };
    }
    async remove(id) {
        await this.testFlowsService.remove(id);
        return {
            success: true,
            message: 'TestFlow removido com sucesso',
        };
    }
    async execute(id) {
        const execution = await this.testFlowsService.execute(id, '00000000-0000-0000-0000-000000000001');
        return {
            success: true,
            data: execution,
            message: 'Execução iniciada com sucesso',
        };
    }
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
    async getDebugData() {
        try {
            const flows = await this.testFlowsService.findAll({ page: 1, limit: 3 });
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                stack: error.stack
            };
        }
    }
    async testExecution() {
        try {
            console.log('🧪 Iniciando teste de execução completo...');
            const playwrightAvailable = await this.playwrightExecutor.isPlaywrightAvailable();
            console.log(`🎭 Playwright disponível: ${playwrightAvailable}`);
            const testFlowData = {
                name: `Teste Debug ${new Date().toISOString()}`,
                description: 'Fluxo criado automaticamente para teste de debug',
                userId: '00000000-0000-0000-0000-000000000001',
                isActive: true,
                status: 'draft',
                steps: [
                    {
                        id: 'step-1',
                        name: 'Navegar para Google',
                        type: 'navigate',
                        config: { url: 'https://www.google.com' },
                        timeout: 5000,
                        continueOnError: false
                    },
                    {
                        id: 'step-2',
                        name: 'Tirar Screenshot',
                        type: 'screenshot',
                        config: { name: 'teste-debug' },
                        timeout: 2000,
                        continueOnError: true
                    },
                    {
                        id: 'step-3',
                        name: 'Extrair Título',
                        type: 'extract',
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
            console.log('🚀 Iniciando execução do fluxo de teste...');
            const execution = await this.testFlowsService.execute(testFlow.id, '00000000-0000-0000-0000-000000000001');
            console.log(`📦 Execução iniciada: ${execution.id}`);
            console.log('⏳ Aguardando execução (10 segundos)...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            const finalExecution = await this.testFlowsService.getExecution(execution.id);
            console.log(`🏁 Status final: ${finalExecution.status}`);
            console.log(`📊 Passos: ${finalExecution.completedSteps}/${finalExecution.totalSteps} (${finalExecution.failedSteps} falhas)`);
            console.log(`⏱️ Duração: ${finalExecution.duration}ms`);
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
            console.log('🧹 Limpando fluxo de teste...');
            await this.testFlowsService.remove(testFlow.id);
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
        }
        catch (error) {
            console.error('❌ Erro durante teste de execução:', error);
            return {
                success: false,
                error: error.message,
                stack: error.stack,
                message: 'Falha no teste de execução'
            };
        }
    }
};
exports.TestFlowsController = TestFlowsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_test_flow_dto_1.CreateTestFlowDto]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_test_flow_dto_1.QueryTestFlowDto]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_test_flow_dto_1.UpdateTestFlowDto]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "execute", null);
__decorate([
    (0, common_1.Get)('playwright/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "getPlaywrightStatus", null);
__decorate([
    (0, common_1.Get)('debug/data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "getDebugData", null);
__decorate([
    (0, common_1.Post)('debug/test-execution'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestFlowsController.prototype, "testExecution", null);
exports.TestFlowsController = TestFlowsController = __decorate([
    (0, common_1.Controller)('test-flows'),
    __metadata("design:paramtypes", [test_flows_service_1.TestFlowsService,
        playwright_executor_service_1.PlaywrightExecutorService])
], TestFlowsController);
let TestExecutionsController = class TestExecutionsController {
    constructor(testFlowsService) {
        this.testFlowsService = testFlowsService;
    }
    async findAll(flowId) {
        const result = await this.testFlowsService.getExecutions(flowId);
        return {
            success: true,
            data: result.data,
            meta: {
                total: result.total,
            },
        };
    }
    async findOne(id) {
        const execution = await this.testFlowsService.getExecution(id);
        return {
            success: true,
            data: execution,
        };
    }
};
exports.TestExecutionsController = TestExecutionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('flowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestExecutionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestExecutionsController.prototype, "findOne", null);
exports.TestExecutionsController = TestExecutionsController = __decorate([
    (0, common_1.Controller)('test-executions'),
    __metadata("design:paramtypes", [test_flows_service_1.TestFlowsService])
], TestExecutionsController);
//# sourceMappingURL=test-flows.controller.js.map