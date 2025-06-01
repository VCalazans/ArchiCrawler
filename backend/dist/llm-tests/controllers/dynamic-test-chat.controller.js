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
var DynamicTestChatController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicTestChatController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const dynamic_test_agent_service_1 = require("../services/dynamic-test-agent.service");
let DynamicTestChatController = DynamicTestChatController_1 = class DynamicTestChatController {
    constructor(dynamicAgent) {
        this.dynamicAgent = dynamicAgent;
        this.logger = new common_1.Logger(DynamicTestChatController_1.name);
    }
    async startChatTest(request) {
        try {
            this.logger.log(`💬 Nova solicitação de teste via chat: ${request.message}`);
            const testGoal = {
                description: request.message,
                targetUrl: request.targetUrl,
                userId: 'demo-user',
                llmProvider: request.llmProvider,
                model: request.model
            };
            const executionStream = await this.dynamicAgent.executeTestGoal(testGoal);
            const executionId = `chat-${Date.now()}`;
            return {
                success: true,
                executionId,
                message: `🚀 Iniciando teste: "${request.message}". Use o executionId para acompanhar o progresso via SSE.`,
                data: { streamEndpoint: `/llm-tests/chat/stream/${executionId}` }
            };
        }
        catch (error) {
            this.logger.error(`❌ Erro ao iniciar teste via chat: ${error.message}`);
            return {
                success: false,
                message: `Erro ao iniciar teste: ${error.message}`
            };
        }
    }
    streamExecution(executionId) {
        this.logger.log(`📡 Iniciando stream para execução: ${executionId}`);
        return this.createMockExecutionStream().pipe((0, rxjs_1.map)((step) => ({
            type: 'agent-step',
            data: {
                id: step.id,
                description: step.description,
                timestamp: step.timestamp,
                duration: step.duration,
                success: step.result.success,
                screenshot: step.result.screenshot,
                thoughts: step.context.llmThoughts,
                confidence: step.context.confidence
            }
        })));
    }
    async stopExecution(executionId) {
        try {
            await this.dynamicAgent.stopExecution(executionId);
            return {
                success: true,
                message: `Execução ${executionId} interrompida com sucesso`
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Erro ao interromper execução: ${error.message}`
            };
        }
    }
    async getExecutionStatus() {
        return {
            success: true,
            message: 'Status das execuções',
            data: {
                activeExecutions: [],
                totalExecutions: 0
            }
        };
    }
    createMockExecutionStream() {
        return new rxjs_1.Observable(subscriber => {
            let stepCount = 0;
            const maxSteps = 5;
            const mockSteps = [
                '🌐 Navegando para o site...',
                '📱 Analisando página carregada...',
                '🔍 Procurando elementos de login...',
                '✏️ Preenchendo formulário...',
                '✅ Teste concluído com sucesso!'
            ];
            const interval = setInterval(() => {
                if (stepCount >= maxSteps) {
                    subscriber.complete();
                    clearInterval(interval);
                    return;
                }
                const mockStep = {
                    id: `mock-step-${stepCount + 1}`,
                    action: {
                        type: 'navigate',
                        description: mockSteps[stepCount],
                        reasoning: 'Demonstração do sistema dinâmico'
                    },
                    result: {
                        success: true,
                        duration: 1500 + Math.random() * 1000,
                        pageContext: {
                            url: 'https://example.com',
                            title: 'Página de Teste',
                            visibleText: 'Conteúdo da página...',
                            forms: [],
                            buttons: [],
                            links: [],
                            errors: [],
                            loadingState: 'complete',
                            hasChanges: stepCount > 0
                        },
                        changes: [],
                        performance: {
                            loadTime: 800 + Math.random() * 500,
                            domContentLoaded: 600 + Math.random() * 300,
                            networkRequests: Math.floor(Math.random() * 5) + 1,
                            errors: []
                        },
                        screenshot: `data:image/png;base64,mock-screenshot-${stepCount}`
                    },
                    context: {
                        goal: 'Teste de demonstração',
                        targetUrl: 'https://example.com',
                        currentUrl: 'https://example.com',
                        currentStrategy: {
                            approach: 'direct',
                            currentObjective: mockSteps[stepCount],
                            expectedElements: [],
                            fallbackPlan: []
                        },
                        pageState: {
                            url: 'https://example.com',
                            title: 'Página de Teste',
                            visibleText: 'Conteúdo da página...',
                            forms: [],
                            buttons: [],
                            links: [],
                            errors: [],
                            loadingState: 'complete',
                            hasChanges: false
                        },
                        executionHistory: [],
                        isComplete: stepCount === maxSteps - 1,
                        confidence: 85 + stepCount * 3,
                        nextPossibleActions: [],
                        llmThoughts: `Executando passo ${stepCount + 1}: ${mockSteps[stepCount]}`,
                        contextWindow: {
                            maxTokens: 4000,
                            currentTokens: 1500 + stepCount * 200,
                            priorityChunks: [],
                            relevanceThreshold: 0.7,
                            lastOptimization: new Date()
                        },
                        actionMemory: {
                            recentActions: [],
                            successPatterns: [],
                            failurePatterns: [],
                            loopDetection: []
                        },
                        executionState: {
                            currentPhase: 'exploration',
                            adaptationLevel: 0.5,
                            patternConfidence: 0.8,
                            explorationBudget: 10 - stepCount,
                            lastDecisionTime: new Date(),
                            decisionFactors: []
                        }
                    },
                    timestamp: new Date(),
                    duration: 1500 + Math.random() * 1000,
                    description: mockSteps[stepCount]
                };
                subscriber.next(mockStep);
                stepCount++;
            }, 2000);
            return () => {
                clearInterval(interval);
            };
        });
    }
};
exports.DynamicTestChatController = DynamicTestChatController;
__decorate([
    (0, common_1.Post)('execute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DynamicTestChatController.prototype, "startChatTest", null);
__decorate([
    (0, common_1.Sse)('stream/:executionId'),
    __param(0, (0, common_1.Param)('executionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], DynamicTestChatController.prototype, "streamExecution", null);
__decorate([
    (0, common_1.Delete)('execution/:executionId'),
    __param(0, (0, common_1.Param)('executionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DynamicTestChatController.prototype, "stopExecution", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DynamicTestChatController.prototype, "getExecutionStatus", null);
exports.DynamicTestChatController = DynamicTestChatController = DynamicTestChatController_1 = __decorate([
    (0, common_1.Controller)('llm-tests/chat'),
    __metadata("design:paramtypes", [dynamic_test_agent_service_1.DynamicTestAgentService])
], DynamicTestChatController);
//# sourceMappingURL=dynamic-test-chat.controller.js.map