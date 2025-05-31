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
var DynamicTestAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicTestAgentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rxjs_1 = require("rxjs");
const generated_test_entity_1 = require("../entities/generated-test.entity");
const test_execution_entity_1 = require("../../entities/test-execution.entity");
const llm_provider_factory_1 = require("./llm-provider.factory");
const api_key_manager_service_1 = require("./api-key-manager.service");
const realtime_mcp_bridge_service_1 = require("./realtime-mcp-bridge.service");
const intelligent_context_manager_service_1 = require("./intelligent-context-manager.service");
let DynamicTestAgentService = DynamicTestAgentService_1 = class DynamicTestAgentService {
    constructor(generatedTestRepository, executionRepository, llmProviderFactory, apiKeyManager, mcpBridge, contextManager) {
        this.generatedTestRepository = generatedTestRepository;
        this.executionRepository = executionRepository;
        this.llmProviderFactory = llmProviderFactory;
        this.apiKeyManager = apiKeyManager;
        this.mcpBridge = mcpBridge;
        this.contextManager = contextManager;
        this.logger = new common_1.Logger(DynamicTestAgentService_1.name);
        this.executionSubjects = new Map();
    }
    async executeTestGoal(goal) {
        const executionId = this.generateExecutionId();
        this.logger.log(`🎯 Iniciando execução dinâmica: ${goal.description}`);
        const executionSubject = new rxjs_1.Subject();
        this.executionSubjects.set(executionId, executionSubject);
        this.executeGoalInBackground(goal, executionId, executionSubject);
        return executionSubject.asObservable();
    }
    async executeGoalInBackground(goal, executionId, subject) {
        try {
            const initialContext = await this.interpretTestGoal(goal);
            let currentContext = initialContext;
            let stepCounter = 0;
            const maxSteps = 50;
            this.logger.log(`🧠 Objetivo interpretado: ${currentContext.currentStrategy.currentObjective}`);
            while (!currentContext.isComplete && stepCounter < maxSteps) {
                stepCounter++;
                try {
                    const nextAction = await this.decideNextAction(currentContext, goal);
                    this.logger.debug(`🎯 Passo ${stepCounter}: ${nextAction.description}`);
                    const startTime = Date.now();
                    const mcpResult = await this.mcpBridge.executeActionWithAnalysis(nextAction);
                    const duration = Date.now() - startTime;
                    currentContext = await this.contextManager.updateContextWithMCPResult(currentContext, nextAction, mcpResult);
                    const agentStep = {
                        id: `${executionId}-step-${stepCounter}`,
                        action: nextAction,
                        result: mcpResult,
                        context: { ...currentContext },
                        timestamp: new Date(),
                        duration,
                        description: nextAction.description
                    };
                    subject.next(agentStep);
                    currentContext = await this.evaluateGoalCompletion(currentContext, goal);
                    await this.wait(1000);
                }
                catch (stepError) {
                    this.logger.error(`❌ Erro no passo ${stepCounter}: ${stepError.message}`);
                    currentContext = await this.handleStepError(currentContext, stepError);
                    if (currentContext.confidence < 20) {
                        this.logger.error('🛑 Confiança muito baixa, parando execução');
                        break;
                    }
                }
            }
            await this.finalizeExecution(executionId, currentContext);
            subject.complete();
        }
        catch (error) {
            this.logger.error(`❌ Erro crítico na execução: ${error.message}`);
            subject.error(error);
        }
        finally {
            this.executionSubjects.delete(executionId);
        }
    }
    async interpretTestGoal(goal) {
        const apiKey = await this.apiKeyManager.getDecryptedApiKey(goal.userId, goal.llmProvider);
        const provider = this.llmProviderFactory.createProvider(goal.llmProvider);
        const interpretationPrompt = {
            system: `Você é um especialista em testes web. Analise o objetivo do usuário e crie uma estratégia inicial para testá-lo.
      
      RESPONDA EM JSON com esta estrutura EXATA:
      {
        "strategy": {
          "approach": "direct|exploratory|fallback",
          "currentObjective": "primeiro objetivo específico",
          "expectedElements": ["elemento1", "elemento2"],
          "fallbackPlan": ["plano B se não funcionar"]
        },
        "initialAction": {
          "type": "navigate",
          "url": "URL_PARA_NAVEGAR", 
          "description": "Por que navegar aqui primeiro",
          "reasoning": "Explicação da estratégia"
        },
        "confidence": 85,
        "thoughts": "Seus pensamentos sobre este teste"
      }`,
            user: `Objetivo: ${goal.description}
             URL Alvo: ${goal.targetUrl}
             
             Crie uma estratégia para testar este objetivo passo a passo.`,
            context: ''
        };
        const response = await provider.generateTest(interpretationPrompt, apiKey);
        const parsed = JSON.parse(response.testCode);
        return {
            goal: goal.description,
            targetUrl: goal.targetUrl,
            currentUrl: '',
            currentStrategy: parsed.strategy,
            pageState: {
                url: '',
                title: '',
                visibleText: '',
                forms: [],
                buttons: [],
                links: [],
                errors: [],
                loadingState: 'loading',
                hasChanges: false
            },
            executionHistory: [],
            isComplete: false,
            confidence: parsed.confidence || 70,
            nextPossibleActions: [parsed.initialAction],
            llmThoughts: parsed.thoughts
        };
    }
    async decideNextAction(context, goal) {
        const apiKey = await this.apiKeyManager.getDecryptedApiKey(goal.userId, goal.llmProvider);
        const provider = this.llmProviderFactory.createProvider(goal.llmProvider);
        const decisionPrompt = {
            system: `Você é um agente de testes inteligente. Baseado no contexto atual, decida a próxima ação mais apropriada.

      RESPONDA EM JSON com esta estrutura EXATA:
      {
        "action": {
          "type": "navigate|click|fill|screenshot|wait|analyze|assert|extract",
          "selector": "seletor_css_se_necessario",
          "value": "valor_se_necessario", 
          "url": "url_se_navigate",
          "timeout": 5000,
          "description": "Descrição clara da ação",
          "reasoning": "Por que esta ação é a melhor agora"
        },
        "thoughts": "Seus pensamentos sobre o estado atual",
        "confidence": 85
      }`,
            user: `CONTEXTO ATUAL:
      Objetivo: ${context.goal}
      URL Atual: ${context.pageState.url}
      Título da Página: ${context.pageState.title}
      Estratégia Atual: ${context.currentStrategy.currentObjective}
      Elementos Visíveis: ${context.pageState.visibleText.substring(0, 500)}...
      Formulários: ${JSON.stringify(context.pageState.forms)}
      Botões: ${JSON.stringify(context.pageState.buttons)}
      Confiança: ${context.confidence}%
      
      HISTÓRICO RECENTE:
      ${context.executionHistory.slice(-3).map(step => `- ${step.action.description} → ${step.result.success ? 'Sucesso' : 'Falha'}`).join('\n')}
      
      Decida a próxima ação mais apropriada para avançar em direção ao objetivo.`,
            context: ''
        };
        const response = await provider.generateTest(decisionPrompt, apiKey);
        const parsed = JSON.parse(response.testCode);
        return parsed.action;
    }
    async evaluateGoalCompletion(context, goal) {
        const apiKey = await this.apiKeyManager.getDecryptedApiKey(goal.userId, goal.llmProvider);
        const provider = this.llmProviderFactory.createProvider(goal.llmProvider);
        const evaluationPrompt = {
            system: `Avalie se o objetivo de teste foi completado com sucesso.
      
      RESPONDA EM JSON com esta estrutura EXATA:
      {
        "isComplete": true/false,
        "confidence": 95,
        "summary": "Resumo do que foi testado",
        "result": "success|partial|failure",
        "thoughts": "Análise da situação atual"
      }`,
            user: `OBJETIVO ORIGINAL: ${context.goal}
      
      ESTADO ATUAL:
      URL: ${context.pageState.url}
      Título: ${context.pageState.title}
      Texto Visível: ${context.pageState.visibleText.substring(0, 300)}...
      Erros Detectados: ${context.pageState.errors.join(', ')}
      
      HISTÓRICO DE AÇÕES:
      ${context.executionHistory.map(step => `${step.action.description} → ${step.result.success ? '✅' : '❌'}`).join('\n')}
      
      O objetivo foi alcançado?`,
            context: ''
        };
        const response = await provider.generateTest(evaluationPrompt, apiKey);
        const evaluation = JSON.parse(response.testCode);
        return {
            ...context,
            isComplete: evaluation.isComplete,
            confidence: evaluation.confidence,
            llmThoughts: evaluation.thoughts
        };
    }
    async handleStepError(context, error) {
        this.logger.warn(`⚠️ Tentando recuperar do erro: ${error.message}`);
        return {
            ...context,
            confidence: Math.max(context.confidence - 15, 0),
            currentStrategy: {
                ...context.currentStrategy,
                approach: 'fallback',
                currentObjective: `Recuperar do erro: ${error.message}`
            }
        };
    }
    async finalizeExecution(executionId, context) {
        this.logger.log(`✅ Execução finalizada - Confiança: ${context.confidence}%`);
        const execution = this.executionRepository.create({
            testFlowId: executionId,
            userId: 'demo-user',
            status: context.isComplete ? test_execution_entity_1.TestExecutionStatus.SUCCESS : test_execution_entity_1.TestExecutionStatus.FAILED,
            startTime: new Date(Date.now() - (context.executionHistory.length * 2000)),
            endTime: new Date(),
            totalSteps: context.executionHistory.length,
            completedSteps: context.executionHistory.filter(s => s.result.success).length,
            failedSteps: context.executionHistory.filter(s => !s.result.success).length,
            steps: context.executionHistory.map(step => ({
                stepId: step.id,
                status: step.result.success ? test_execution_entity_1.TestExecutionStatus.SUCCESS : test_execution_entity_1.TestExecutionStatus.FAILED,
                startTime: step.timestamp,
                endTime: new Date(step.timestamp.getTime() + step.duration),
                duration: step.duration,
                result: {
                    action: step.action.description,
                    data: step.result.data,
                    screenshot: step.result.screenshot
                }
            }))
        });
        await this.executionRepository.save(execution);
    }
    async stopExecution(executionId) {
        const subject = this.executionSubjects.get(executionId);
        if (subject) {
            subject.complete();
            this.executionSubjects.delete(executionId);
            this.logger.log(`🛑 Execução ${executionId} interrompida`);
        }
    }
    generateExecutionId() {
        return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.DynamicTestAgentService = DynamicTestAgentService;
exports.DynamicTestAgentService = DynamicTestAgentService = DynamicTestAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(generated_test_entity_1.GeneratedTest)),
    __param(1, (0, typeorm_1.InjectRepository)(test_execution_entity_1.TestExecution)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        llm_provider_factory_1.LLMProviderFactory,
        api_key_manager_service_1.ApiKeyManagerService,
        realtime_mcp_bridge_service_1.RealtimeMCPBridge,
        intelligent_context_manager_service_1.IntelligentContextManager])
], DynamicTestAgentService);
//# sourceMappingURL=dynamic-test-agent.service.js.map