import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, Subject } from 'rxjs';
import { GeneratedTest } from '../entities/generated-test.entity';
import { TestExecution, TestExecutionStatus, ExecutionStep } from '../../entities/test-execution.entity';
import { LLMProviderFactory } from './llm-provider.factory';
import { ApiKeyManagerService } from './api-key-manager.service';
import { RealtimeMCPBridge } from './realtime-mcp-bridge.service';
import { IntelligentContextManager } from './intelligent-context-manager.service';
import { 
  PageChange, 
  PerformanceMetrics, 
  FormInfo, 
  ButtonInfo, 
  LinkInfo, 
  DOMElement 
} from '../interfaces/dynamic-agent.interface';

// Interfaces para o sistema dinâmico
export interface TestGoal {
  description: string;
  targetUrl: string;
  userId: string;
  llmProvider: string;
  model?: string;
}

export interface AgentStep {
  id: string;
  action: MCPAction;
  result: MCPResult;
  context: TestContext;
  timestamp: Date;
  duration: number;
  description: string;
}

export interface MCPAction {
  type: 'navigate' | 'click' | 'fill' | 'screenshot' | 'wait' | 'analyze' | 'assert' | 'extract';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  description: string;
  reasoning: string; // Por que a LLM decidiu essa ação
}

export interface MCPResult {
  success: boolean;
  duration: number;
  data?: any;
  error?: string;
  pageContext: PageContext;
  changes: PageChange[];
  screenshot?: string;
  performance?: PerformanceMetrics;
}

export interface TestContext {
  goal: string;
  targetUrl: string;
  currentUrl: string;
  currentStrategy: TestStrategy;
  pageState: PageContext;
  executionHistory: AgentStep[];
  isComplete: boolean;
  confidence: number;
  nextPossibleActions: MCPAction[];
  llmThoughts: string; // Pensamentos da LLM sobre o estado atual
}

export interface PageContext {
  url: string;
  title: string;
  visibleText: string;
  forms: FormInfo[];
  buttons: ButtonInfo[];
  links: LinkInfo[];
  errors: string[];
  loadingState: 'loading' | 'complete' | 'error';
  hasChanges: boolean;
}

export interface TestStrategy {
  approach: 'direct' | 'exploratory' | 'fallback';
  currentObjective: string;
  expectedElements: string[];
  fallbackPlan: string[];
}

@Injectable()
export class DynamicTestAgentService {
  private readonly logger = new Logger(DynamicTestAgentService.name);
  private executionSubjects = new Map<string, Subject<AgentStep>>();

  constructor(
    @InjectRepository(GeneratedTest)
    private generatedTestRepository: Repository<GeneratedTest>,
    @InjectRepository(TestExecution)
    private executionRepository: Repository<TestExecution>,
    private llmProviderFactory: LLMProviderFactory,
    private apiKeyManager: ApiKeyManagerService,
    private mcpBridge: RealtimeMCPBridge,
    private contextManager: IntelligentContextManager,
  ) {}

  /**
   * 🚀 Executa um objetivo de teste de forma dinâmica e conversacional
   */
  async executeTestGoal(goal: TestGoal): Promise<Observable<AgentStep>> {
    const executionId = this.generateExecutionId();
    this.logger.log(`🎯 Iniciando execução dinâmica: ${goal.description}`);

    // Criar subject para streaming de resultados
    const executionSubject = new Subject<AgentStep>();
    this.executionSubjects.set(executionId, executionSubject);

    // Executar de forma assíncrona
    this.executeGoalInBackground(goal, executionId, executionSubject);

    return executionSubject.asObservable();
  }

  /**
   * 🔄 Loop principal de execução dinâmica
   */
  private async executeGoalInBackground(
    goal: TestGoal, 
    executionId: string, 
    subject: Subject<AgentStep>
  ): Promise<void> {
    try {
      // 1. 🧠 Interpretar objetivo inicial
      const initialContext = await this.interpretTestGoal(goal);
      let currentContext = initialContext;
      let stepCounter = 0;
      const maxSteps = 50; // Limite de segurança

      this.logger.log(`🧠 Objetivo interpretado: ${currentContext.currentStrategy.currentObjective}`);

      // 2. 🔄 Loop dinâmico de execução
      while (!currentContext.isComplete && stepCounter < maxSteps) {
        stepCounter++;
        
        try {
          // 2.1 🧠 LLM decide próxima ação baseada no contexto atual
          const nextAction = await this.decideNextAction(currentContext, goal);
          
          this.logger.debug(`🎯 Passo ${stepCounter}: ${nextAction.description}`);
          
          // 2.2 📱 Executar ação via MCP
          const startTime = Date.now();
          const mcpResult = await this.mcpBridge.executeActionWithAnalysis(nextAction);
          const duration = Date.now() - startTime;
          
          // 2.3 🧠 LLM interpreta resultado e atualiza contexto
          currentContext = await this.contextManager.updateContextWithMCPResult(
            currentContext,
            nextAction,
            mcpResult
          );

          // 2.4 📊 Criar step para histórico
          const agentStep: AgentStep = {
            id: `${executionId}-step-${stepCounter}`,
            action: nextAction,
            result: mcpResult,
            context: { ...currentContext },
            timestamp: new Date(),
            duration,
            description: nextAction.description
          };

          // 2.5 📡 Enviar update em tempo real
          subject.next(agentStep);

          // 2.6 🎯 Verificar se objetivo foi alcançado
          currentContext = await this.evaluateGoalCompletion(currentContext, goal);

          // 2.7 ⏳ Aguardar entre ações para estabilidade
          await this.wait(1000);

        } catch (stepError) {
          this.logger.error(`❌ Erro no passo ${stepCounter}: ${stepError.message}`);
          
          // Tentar recuperar do erro
          currentContext = await this.handleStepError(currentContext, stepError);
          
          if (currentContext.confidence < 20) {
            this.logger.error('🛑 Confiança muito baixa, parando execução');
            break;
          }
        }
      }

      // 3. ✅ Finalizar execução
      await this.finalizeExecution(executionId, currentContext);
      subject.complete();

    } catch (error) {
      this.logger.error(`❌ Erro crítico na execução: ${error.message}`);
      subject.error(error);
    } finally {
      this.executionSubjects.delete(executionId);
    }
  }

  /**
   * 🧠 Interpreta o objetivo inicial e cria contexto
   */
  private async interpretTestGoal(goal: TestGoal): Promise<TestContext> {
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

  /**
   * 🧠 Decide próxima ação baseada no contexto atual
   */
  private async decideNextAction(context: TestContext, goal: TestGoal): Promise<MCPAction> {
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
      ${context.executionHistory.slice(-3).map(step => 
        `- ${step.action.description} → ${step.result.success ? 'Sucesso' : 'Falha'}`
      ).join('\n')}
      
      Decida a próxima ação mais apropriada para avançar em direção ao objetivo.`,
      context: ''
    };

    const response = await provider.generateTest(decisionPrompt, apiKey);
    const parsed = JSON.parse(response.testCode);

    return parsed.action;
  }

  /**
   * 🎯 Avalia se o objetivo foi completado
   */
  private async evaluateGoalCompletion(context: TestContext, goal: TestGoal): Promise<TestContext> {
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
      ${context.executionHistory.map(step => 
        `${step.action.description} → ${step.result.success ? '✅' : '❌'}`
      ).join('\n')}
      
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

  /**
   * ⚠️ Lida com erros durante execução
   */
  private async handleStepError(context: TestContext, error: Error): Promise<TestContext> {
    this.logger.warn(`⚠️ Tentando recuperar do erro: ${error.message}`);
    
    // Reduzir confiança e ajustar estratégia
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

  /**
   * ✅ Finaliza execução e salva resultados
   */
  private async finalizeExecution(executionId: string, context: TestContext): Promise<void> {
    this.logger.log(`✅ Execução finalizada - Confiança: ${context.confidence}%`);
    
    // Salvar resultado no banco
    const execution = this.executionRepository.create({
      testFlowId: executionId,
      userId: 'demo-user', // TODO: Pegar do contexto
      status: context.isComplete ? TestExecutionStatus.SUCCESS : TestExecutionStatus.FAILED,
      startTime: new Date(Date.now() - (context.executionHistory.length * 2000)),
      endTime: new Date(),
      totalSteps: context.executionHistory.length,
      completedSteps: context.executionHistory.filter(s => s.result.success).length,
      failedSteps: context.executionHistory.filter(s => !s.result.success).length,
      steps: context.executionHistory.map(step => ({
        stepId: step.id,
        status: step.result.success ? TestExecutionStatus.SUCCESS : TestExecutionStatus.FAILED,
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

  /**
   * 🛑 Para execução em andamento
   */
  async stopExecution(executionId: string): Promise<void> {
    const subject = this.executionSubjects.get(executionId);
    if (subject) {
      subject.complete();
      this.executionSubjects.delete(executionId);
      this.logger.log(`🛑 Execução ${executionId} interrompida`);
    }
  }

  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 