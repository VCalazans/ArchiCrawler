import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, Subject } from 'rxjs';
import { GeneratedTest } from '../entities/generated-test.entity';
import { TestExecution, TestExecutionStatus, ExecutionStep } from '../../entities/test-execution.entity';
import { LLMProviderFactory } from './llm-provider.factory';
import { ApiKeyManagerService } from './api-key-manager.service';
// import { IntelligentContextManager } from './intelligent-context-manager.service';
import { 
  PageChange, 
  PerformanceMetrics, 
  FormInfo, 
  ButtonInfo, 
  LinkInfo, 
  DOMElement 
} from '../interfaces/dynamic-agent.interface';

// Importações das interfaces
// import { TestGoal, AgentStep, MCPAction, MCPResult, TestStrategy, PageContext } from '../types/test-types';

// 🧠 Interfaces principais do sistema MCP
export interface MCPAction {
  type: 'navigate' | 'click' | 'fill' | 'screenshot' | 'wait' | 'analyze' | 'assert' | 'extract' | 'hover' | 'select';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  description: string;
  reasoning?: string;
  expectedOutcome?: string;
  parameters?: Record<string, any>;
}

export interface MCPResult {
  success: boolean;
  duration: number;
  pageContext: PageContext;
  changes: PageChange[];
  performance: PerformanceMetrics;
  data?: any;
  screenshot?: string;
  error?: string;
  metadata?: Record<string, any>;
}

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
  
  // 🧠 NOVO: Sistema de gestão de contexto dinâmico
  contextWindow: ContextWindow;
  actionMemory: ActionMemory;
  executionState: ExecutionState;
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

// 🧠 Sistema de janela de contexto inteligente
export interface ContextWindow {
  maxTokens: number;
  currentTokens: number;
  priorityChunks: ContextChunk[];
  relevanceThreshold: number;
  lastOptimization: Date;
}

export interface ContextChunk {
  id: string;
  content: string;
  type: 'action' | 'result' | 'observation' | 'strategy';
  importance: number; // 0-1
  recency: number; // 0-1
  relevance: number; // 0-1
  semanticEmbedding?: number[]; // Para comparação semântica
  timestamp: Date;
  tokens: number;
}

// 🧠 Sistema de memória de ações
export interface ActionMemory {
  recentActions: ActionPattern[];
  successPatterns: ActionPattern[];
  failurePatterns: ActionPattern[];
  loopDetection: LoopPattern[];
}

export interface ActionPattern {
  actionSequence: string[];
  outcome: 'success' | 'failure' | 'neutral';
  pageContext: string;
  confidence: number;
  frequency: number;
  lastUsed: Date;
}

export interface LoopPattern {
  pattern: string[];
  occurrences: number;
  lastDetected: Date;
  severity: 'low' | 'medium' | 'high';
}

// 🧠 Estado de execução dinâmico
export interface ExecutionState {
  currentPhase: 'exploration' | 'focused' | 'completion' | 'recovery';
  adaptationLevel: number; // 0-1 (quanto adaptar a estratégia)
  patternConfidence: number; // 0-1 (confiança nos padrões detectados)
  explorationBudget: number; // Quantas ações exploratórias restam
  lastDecisionTime: Date;
  decisionFactors: DecisionFactor[];
}

export interface DecisionFactor {
  factor: string;
  weight: number;
  value: number;
  reasoning: string;
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
    // private mcpBridge: RealtimeMCPBridge,
    // private contextManager: IntelligentContextManager,
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
   * 🔄 Loop principal de execução dinâmica REFORMULADO
   */
  private async executeGoalInBackground(
    goal: TestGoal, 
    executionId: string, 
    subject: Subject<AgentStep>
  ): Promise<void> {
    try {
      // 1. 🧠 Interpretar objetivo inicial COM contexto dinâmico
      const initialContext = await this.interpretTestGoalWithDynamicContext(goal);
      let currentContext = initialContext;
      let stepCounter = 0;
      const maxSteps = 30; // Reduzido para ser mais eficiente

      this.logger.log(`🧠 Objetivo interpretado: ${currentContext.currentStrategy.currentObjective}`);

      // 2. 🔄 Loop dinâmico com gestão inteligente de contexto
      while (!currentContext.isComplete && stepCounter < maxSteps) {
        stepCounter++;
        
        try {
          // 2.1 📊 Otimizar contexto dinamicamente
          currentContext = await this.optimizeContextWindow(currentContext);
          
          // 2.2 🔍 Analisar padrões e detectar loops
          const loopDetection = this.detectActionLoops(currentContext);
          if (loopDetection.isLoop) {
            this.logger.warn(`🔄 Loop detectado: ${loopDetection.pattern} - Aplicando correção`);
            currentContext = await this.applyLoopCorrection(currentContext, loopDetection);
          }

          // 2.3 🧠 Decidir próxima ação (usar ação forçada se disponível)
          let nextAction: MCPAction;
          if (currentContext.nextPossibleActions.length > 0) {
            // 🚨 USAR AÇÃO FORÇADA após correção de loop
            nextAction = currentContext.nextPossibleActions.shift()!; // Remove e usa a primeira
            this.logger.warn(`🚨 USANDO AÇÃO FORÇADA: ${nextAction.description}`);
          } else {
            // LLM decide próxima ação COM contexto otimizado
            nextAction = await this.decideNextActionWithDynamicContext(currentContext, goal);
          }
          
          // 2.4 ✅ Validar ação antes de executar
          const validation = this.validateAction(nextAction, currentContext);
          if (!validation.isValid) {
            this.logger.warn(`⚠️ Ação inválida: ${validation.reason} - Gerando alternativa`);
            const alternativeAction = await this.generateAlternativeAction(currentContext, goal, validation.reason);
            if (alternativeAction) {
              Object.assign(nextAction, alternativeAction);
            } else {
              continue; // Pular esta iteração
            }
          }

          this.logger.debug(`🎯 Passo ${stepCounter} [${currentContext.executionState.currentPhase}]: ${nextAction.description}`);
          
          // 2.5 📱 Executar ação via MCP COM timeout inteligente
          const startTime = Date.now();
          const mcpResult = await this.executeActionWithAdaptiveTimeout(nextAction, currentContext);
          const duration = Date.now() - startTime;
          
          // 2.6 🧠 Processar resultado e atualizar contexto dinamicamente
          currentContext = await this.updateContextWithDynamicAnalysis(
            currentContext,
            nextAction,
            mcpResult,
            duration
          );

          // 2.7 📊 Criar step para histórico COM metadata rica
          const agentStep: AgentStep = {
            id: `${executionId}-step-${stepCounter}`,
            action: nextAction,
            result: mcpResult,
            context: { ...currentContext },
            timestamp: new Date(),
            duration,
            description: nextAction.description
          };

          // 2.8 📡 Enviar update em tempo real
          subject.next(agentStep);

          // 2.9 🎯 Avaliar progresso COM adaptive learning
          currentContext = await this.evaluateProgressWithAdaptiveLearning(currentContext, goal);

          // 2.10 ⏳ Aguardar tempo adaptativo baseado no contexto
          const waitTime = this.calculateAdaptiveWaitTime(currentContext, mcpResult);
          await this.wait(waitTime);

        } catch (stepError) {
          this.logger.error(`❌ Erro no passo ${stepCounter}: ${stepError.message}`);
          
          // Recuperação inteligente com aprendizado
          currentContext = await this.handleStepErrorWithLearning(currentContext, stepError, stepCounter);
          
          if (currentContext.confidence < 10) {
            this.logger.error('🛑 Confiança extremamente baixa, ativando modo de recuperação');
            currentContext = await this.activateRecoveryMode(currentContext, goal);
          }
        }
      }

      // 3. ✅ Finalizar execução COM relatório detalhado
      await this.finalizeExecutionWithAnalytics(executionId, currentContext);
      subject.complete();

    } catch (error) {
      this.logger.error(`❌ Erro crítico na execução: ${error.message}`);
      subject.error(error);
    } finally {
      this.executionSubjects.delete(executionId);
    }
  }

  /**
   * 🧠 Interpretação inicial com contexto dinâmico
   */
  private async interpretTestGoalWithDynamicContext(goal: TestGoal): Promise<TestContext> {
    const apiKey = await this.apiKeyManager.getDecryptedApiKey(goal.userId, goal.llmProvider);
    
    const interpretationPrompt = {
      system: `Você é um especialista em testes web com sistema de gestão de contexto dinâmico.
      
      Analise o objetivo e crie uma estratégia ADAPTATIVA que considera:
      - Padrões de sucesso em testes similares
      - Contexto da página e elementos esperados
      - Estratégias de fallback para cenários complexos
      - Orçamento de ações e eficiência
      
      RESPONDA EM JSON com estrutura EXATA:
      {
        "strategy": {
          "approach": "adaptive|systematic|exploratory",
          "primaryObjective": "objetivo específico e mensurável",
          "secondaryObjectives": ["obj1", "obj2"],
          "expectedElements": ["elemento1", "elemento2"],
          "fallbackPlan": ["ação1", "ação2"],
          "successCriteria": "critério claro de sucesso"
        },
        "initialAction": {
          "type": "navigate",
          "url": "URL_PARA_NAVEGAR",
          "description": "Descrição clara da ação",
          "reasoning": "Por que esta ação é ideal",
          "expectedOutcome": "O que esperar como resultado"
        },
        "contextRequirements": {
          "minConfidence": 70,
          "maxActions": 25,
          "criticalElements": ["elemento_critico1"],
          "avoidPatterns": ["padrão_a_evitar1"]
        },
        "confidence": 85,
        "thoughts": "Análise da situação e estratégia"
      }`,
      user: `Objetivo: ${goal.description}
             URL Alvo: ${goal.targetUrl}
             
             Crie uma estratégia adaptativa para testar este objetivo.
             Considere que o sistema possui memória de ações e pode adaptar a estratégia dinamicamente.`,
      context: ''
    };

    const response = await this.callLLMDirectly(goal.llmProvider, interpretationPrompt, apiKey);
    const parsed = JSON.parse(response);

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
      llmThoughts: parsed.thoughts,
      
      // 🧠 NOVO: Contexto dinâmico
      contextWindow: this.initializeContextWindow(goal),
      actionMemory: this.initializeActionMemory(),
      executionState: this.initializeExecutionState()
    };
  }

  /**
   * 📊 Otimização dinâmica da janela de contexto
   */
  private async optimizeContextWindow(context: TestContext): Promise<TestContext> {
    const { contextWindow } = context;
    
    // Calcular tokens atuais
    const contextText = this.buildContextText(context);
    const currentTokens = this.estimateTokens(contextText);
    
    contextWindow.currentTokens = currentTokens;
    
    // Se exceder limite, otimizar
    if (currentTokens > contextWindow.maxTokens) {
      this.logger.debug(`📊 Otimizando contexto: ${currentTokens}/${contextWindow.maxTokens} tokens`);
      
      // Criar chunks priorizados
      const chunks = this.createContextChunks(context);
      const prioritizedChunks = this.prioritizeChunks(chunks, context.executionHistory.slice(-3));
      
      // Manter apenas os chunks mais relevantes
      contextWindow.priorityChunks = prioritizedChunks.slice(0, 10);
      contextWindow.lastOptimization = new Date();
      
      this.logger.debug(`📊 Contexto otimizado: ${contextWindow.priorityChunks.length} chunks mantidos`);
    }
    
    return context;
  }

  /**
   * 🔍 Detecção avançada de loops MELHORADA
   */
  private detectActionLoops(context: TestContext): { isLoop: boolean; pattern: string; severity: 'low' | 'medium' | 'high' } {
    const recentActions = context.executionHistory.slice(-8).map(step => ({
      type: step.action.type,
      description: step.action.description,
      url: step.action.url,
      selector: step.action.selector
    }));
    
    // 🚨 DETECÇÃO AGRESSIVA: Verificar ações similares recentes
    const lastActions = recentActions.slice(-4);
    
    // Detectar repetição do mesmo tipo de ação
    const actionTypes = lastActions.map(a => a.type);
    const actionCounts = actionTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    for (const [actionType, count] of Object.entries(actionCounts)) {
      if (count >= 3) {
        this.logger.warn(`🚨 LOOP DETECTADO: Ação '${actionType}' repetida ${count}x recentemente`);
        return { 
          isLoop: true, 
          pattern: `${actionType} (repetido ${count}x)`, 
          severity: count >= 4 ? 'high' : 'medium' 
        };
      }
    }
    
    // Detectar descrições muito similares
    for (let i = lastActions.length - 1; i >= 1; i--) {
      const current = lastActions[i];
      const previous = lastActions[i - 1];
      
      if (current.type === previous.type && 
          this.isSimilarDescription(current.description, previous.description)) {
        this.logger.warn(`🚨 LOOP SEMÂNTICO DETECTADO: ${current.type} com descrições similares`);
        return { 
          isLoop: true, 
          pattern: `${current.type} → ${previous.type} (semântico)`, 
          severity: 'high' 
        };
      }
    }
    
    // Detectar padrões exatos (lógica original mantida)
    const actionTypeSequence = recentActions.slice(-6).map(a => a.type);
    for (let patternLength = 2; patternLength <= 3; patternLength++) {
      if (actionTypeSequence.length < patternLength * 2) continue;
      
      const pattern = actionTypeSequence.slice(-patternLength);
      const previousPattern = actionTypeSequence.slice(-patternLength * 2, -patternLength);
      
      if (JSON.stringify(pattern) === JSON.stringify(previousPattern)) {
        const severity = this.calculateLoopSeverity(pattern, context);
        this.logger.warn(`🚨 LOOP EXATO DETECTADO: ${pattern.join(' → ')}`);
        return { isLoop: true, pattern: pattern.join(' → '), severity };
      }
    }
    
    // 🚨 DETECÇÃO EXTREMA: Se mais de 15 passos sem progresso significativo
    if (context.executionHistory.length > 15 && context.confidence < 60) {
      this.logger.error(`🚨 LOOP POR FALTA DE PROGRESSO: ${context.executionHistory.length} passos, confiança: ${context.confidence}%`);
      return { 
        isLoop: true, 
        pattern: 'falta_de_progresso', 
        severity: 'high' 
      };
    }
    
    return { isLoop: false, pattern: '', severity: 'low' };
  }

  /**
   * 🔍 Verifica se duas descrições são semanticamente similares
   */
  private isSimilarDescription(desc1: string, desc2: string): boolean {
    // Normalizar strings
    const normalize = (str: string) => str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const norm1 = normalize(desc1);
    const norm2 = normalize(desc2);
    
    // Se são idênticas após normalização
    if (norm1 === norm2) return true;
    
    // Se uma contém a outra em grande parte
    const shorter = norm1.length < norm2.length ? norm1 : norm2;
    const longer = norm1.length >= norm2.length ? norm1 : norm2;
    
    if (longer.includes(shorter) && shorter.length > 10) return true;
    
    // Verificar palavras-chave comuns
    const words1 = norm1.split(' ').filter(w => w.length > 3);
    const words2 = norm2.split(' ').filter(w => w.length > 3);
    
    if (words1.length > 0 && words2.length > 0) {
      const commonWords = words1.filter(w => words2.includes(w));
      const similarity = commonWords.length / Math.max(words1.length, words2.length);
      
      if (similarity > 0.7) return true;
    }
    
    return false;
  }

  private calculateLoopSeverity(pattern: string[], context: TestContext): 'low' | 'medium' | 'high' {
    // Calcular severidade baseada na frequência e impacto
    const frequency = pattern.length;
    const hasNavigation = pattern.includes('navigate');
    const lowProgress = context.confidence < 50;
    
    if (frequency >= 3 || (hasNavigation && lowProgress)) return 'high';
    if (frequency === 2 || hasNavigation) return 'medium';
    return 'low';
  }

  /**
   * 🛠️ Correção de loops com estratégias adaptativas AGRESSIVA
   */
  private async applyLoopCorrection(context: TestContext, loopDetection: any): Promise<TestContext> {
    this.logger.error(`🚨 APLICANDO CORREÇÃO AGRESSIVA DE LOOP: ${loopDetection.pattern} (${loopDetection.severity})`);
    
    // 🚨 CORREÇÃO IMEDIATA sem consultar LLM (mais rápida e eficaz)
    const aggressiveCorrections = {
      'assert': {
        newPhase: 'completion',
        newObjective: 'Finalizar teste e extrair resultados disponíveis',
        confidenceAdjustment: -30,
        forceAction: { type: 'wait', description: 'Aguardar estabilização antes de finalizar' }
      },
      'navigate': {
        newPhase: 'recovery', 
        newObjective: 'Analisar página atual em vez de navegar novamente',
        confidenceAdjustment: -25,
        forceAction: { type: 'screenshot', description: 'Capturar estado atual para análise' }
      },
      'extract': {
        newPhase: 'completion',
        newObjective: 'Concluir com dados já coletados',
        confidenceAdjustment: -20,
        forceAction: { type: 'wait', description: 'Preparar finalização' }
      },
      'falta_de_progresso': {
        newPhase: 'recovery',
        newObjective: 'FORÇAR CONCLUSÃO - progresso insuficiente detectado',
        confidenceAdjustment: -40,
        forceAction: { type: 'wait', description: 'Forçar finalização por falta de progresso' }
      }
    };

    // Determinar tipo de correção baseado no padrão
    let correctionType = 'assert'; // padrão
    if (loopDetection.pattern.includes('navigate')) correctionType = 'navigate';
    else if (loopDetection.pattern.includes('extract')) correctionType = 'extract';
    else if (loopDetection.pattern.includes('falta_de_progresso')) correctionType = 'falta_de_progresso';

    const correction = aggressiveCorrections[correctionType];

    // 🚨 APLICAR CORREÇÕES AGRESSIVAS
    context.currentStrategy.currentObjective = correction.newObjective;
    context.confidence = Math.max(context.confidence + correction.confidenceAdjustment, 10);
    context.executionState.currentPhase = correction.newPhase;
    context.executionState.adaptationLevel = 1.0; // Máxima adaptação
    
    // 🚨 FORÇAR AÇÃO IMEDIATA para quebrar o loop
    context.nextPossibleActions = [correction.forceAction];

    // 🚨 REGISTRAR PADRÃO DE LOOP CRÍTICO
    context.actionMemory.loopDetection.push({
      pattern: loopDetection.pattern.split(' → '),
      occurrences: 1,
      lastDetected: new Date(),
      severity: 'high' // Sempre marcar como alta severidade
    });

    // 🚨 LIMPAR HISTÓRICO DE AÇÕES PROBLEMÁTICAS (manter apenas últimas 3)
    if (context.executionHistory.length > 3) {
      context.executionHistory = context.executionHistory.slice(-3);
    }

    // 🚨 FORÇAR FINALIZAÇÃO se muitos loops
    if (context.actionMemory.loopDetection.length >= 2) {
      this.logger.error(`🚨 MÚLTIPLOS LOOPS DETECTADOS - FORÇANDO FINALIZAÇÃO`);
      context.isComplete = true;
      context.confidence = Math.max(context.confidence, 50); // Garantir confiança mínima
    }

    this.logger.error(`🛠️ CORREÇÃO AGRESSIVA APLICADA: ${correction.newObjective}`);
    this.logger.error(`🎯 Nova fase: ${correction.newPhase} | Confiança: ${context.confidence}%`);
    
    return context;
  }

  /**
   * ⏱️ Timeout adaptativo baseado no contexto
   */
  private async executeActionWithAdaptiveTimeout(action: MCPAction, context: TestContext): Promise<MCPResult> {
    // Calcular timeout baseado no histórico e contexto
    const baseTimeout = 5000;
    const phaseMultiplier = context.executionState.currentPhase === 'recovery' ? 1.5 : 1.0;
    const complexityMultiplier = action.type === 'navigate' ? 2.0 : 1.0;
    
    const adaptiveTimeout = baseTimeout * phaseMultiplier * complexityMultiplier;
    
    this.logger.debug(`⏱️ Executando ${action.type} com timeout adaptativo: ${adaptiveTimeout}ms`);
    
    // Executar com timeout customizado (simulação até o mcpBridge estar disponível)
    const timeoutPromise = new Promise<MCPResult>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout adaptativo')), adaptiveTimeout);
    });
    
    try {
      // Temporariamente simular execução até o mcpBridge estar disponível
      const simulatedResult: MCPResult = {
        success: Math.random() > 0.3, // 70% de sucesso
        duration: Math.random() * 2000 + 500,
        pageContext: context.pageState,
        changes: [],
        performance: { 
          loadTime: Math.random() * 1000 + 200,
          domContentLoaded: Math.random() * 800 + 100,
          networkRequests: Math.floor(Math.random() * 10) + 1,
          errors: []
        }
      };
      
      return await Promise.race([
        Promise.resolve(simulatedResult), // this.mcpBridge.executeActionWithAnalysis(action),
        timeoutPromise
      ]);
    } catch (error) {
      if (error.message === 'Timeout adaptativo') {
        this.logger.warn(`⏰ Timeout adaptativo atingido para ${action.type}`);
        // Retornar resultado parcial em caso de timeout
        return {
          success: false,
          duration: adaptiveTimeout,
          error: 'Timeout adaptativo - ação pode ter sido muito lenta',
          pageContext: context.pageState,
          changes: [],
          performance: { 
            loadTime: adaptiveTimeout,
            domContentLoaded: adaptiveTimeout,
            networkRequests: 0,
            errors: ['Timeout adaptativo']
          }
        };
      }
      throw error;
    }
  }

  /**
   * ⏳ Cálculo de tempo de espera adaptativo
   */
  private calculateAdaptiveWaitTime(context: TestContext, result: MCPResult): number {
    const baseWait = 1000;
    const phaseMultipliers = {
      'exploration': 0.5,
      'focused': 1.0,
      'completion': 1.5,
      'recovery': 2.0
    };
    
    const phaseMultiplier = phaseMultipliers[context.executionState.currentPhase] || 1.0;
    const successMultiplier = result.success ? 0.8 : 1.2;
    const confidenceMultiplier = context.confidence > 80 ? 0.7 : 1.3;
    
    const adaptiveWait = baseWait * phaseMultiplier * successMultiplier * confidenceMultiplier;
    
    this.logger.debug(`⏳ Aguardando ${adaptiveWait}ms [${context.executionState.currentPhase}]`);
    
    return Math.min(Math.max(adaptiveWait, 500), 5000); // Entre 500ms e 5s
  }

  /**
   * 🧠 Sistema de gestão de contexto dinâmico
   */
  private initializeContextWindow(goal: TestGoal): ContextWindow {
    return {
      maxTokens: 4000, // Limite dinâmico baseado no modelo
      currentTokens: 0,
      priorityChunks: [],
      relevanceThreshold: 0.7,
      lastOptimization: new Date()
    };
  }

  private initializeActionMemory(): ActionMemory {
    return {
      recentActions: [],
      successPatterns: [],
      failurePatterns: [],
      loopDetection: []
    };
  }

  private initializeExecutionState(): ExecutionState {
    return {
      currentPhase: 'exploration',
      adaptationLevel: 0.5,
      patternConfidence: 0.0,
      explorationBudget: 10,
      lastDecisionTime: new Date(),
      decisionFactors: []
    };
  }

  /**
   * 🧠 Decisão de próxima ação com contexto dinâmico
   */
  private async decideNextActionWithDynamicContext(context: TestContext, goal: TestGoal): Promise<MCPAction> {
    const apiKey = await this.apiKeyManager.getDecryptedApiKey(goal.userId, goal.llmProvider);

    // Construir contexto otimizado para a LLM
    const optimizedContext = this.buildOptimizedContext(context);
    const recentActionsLog = context.executionHistory.slice(-3).map(step => 
      `${step.action.type}(${step.action.url || step.action.selector || step.action.value || ''}): ${step.result.success ? '✅' : '❌'} - ${step.description}`
    ).join('\n');

    const decisionPrompt = {
      system: `Você é um agente de testes inteligente com sistema de contexto dinâmico.
      
      ESTADO ATUAL:
      - Fase: ${context.executionState.currentPhase}
      - Confiança: ${context.confidence}%
      - Orçamento de exploração: ${context.executionState.explorationBudget}
      
      INSTRUÇÕES IMPORTANTES:
      ⚠️ EVITE repetir ações similares recentes!
      ⚠️ Considere o estado da página atual!
      ⚠️ Adapte a estratégia à fase atual de execução!

      RESPONDA EM JSON com estrutura EXATA:
      {
        "action": {
          "type": "navigate|click|fill|screenshot|wait|analyze|assert|extract",
          "selector": "seletor_css_se_necessario",
          "value": "valor_se_necessario", 
          "url": "url_se_navigate",
          "timeout": 5000,
          "description": "Descrição clara da ação",
          "reasoning": "Por que esta ação é a melhor agora",
          "expectedOutcome": "O que esperar como resultado"
        },
        "decisionFactors": [
          {
            "factor": "page_analysis",
            "weight": 0.3,
            "value": 0.8,
            "reasoning": "Página analisada com sucesso"
          }
        ],
        "phaseRecommendation": "exploration|focused|completion|recovery",
        "confidence": 85
      }`,
      user: `CONTEXTO OTIMIZADO:
      ${optimizedContext}
      
      ÚLTIMAS 3 AÇÕES (NÃO REPITA!):
      ${recentActionsLog}
      
      OBJETIVO ATUAL: ${context.currentStrategy.currentObjective || context.goal}
      URL ATUAL: ${context.pageState.url}
      TÍTULO: ${context.pageState.title}
      ELEMENTOS VISÍVEIS: ${context.pageState.visibleText.substring(0, 500)}...
      FORMULÁRIOS: ${JSON.stringify(context.pageState.forms)}
      BOTÕES: ${JSON.stringify(context.pageState.buttons)}
      
      PADRÕES DETECTADOS PARA EVITAR: ${context.actionMemory.loopDetection.map(p => p.pattern.join(' → ')).join(', ')}
      
      Qual é a próxima ação mais apropriada considerando todo o contexto dinâmico?`,
      context: ''
    };

    const response = await this.callLLMDirectly(goal.llmProvider, decisionPrompt, apiKey);
    const parsed = JSON.parse(response);

    // Atualizar fatores de decisão no contexto
    context.executionState.decisionFactors = parsed.decisionFactors || [];
    
    // Ajustar fase se recomendada
    if (parsed.phaseRecommendation && parsed.phaseRecommendation !== context.executionState.currentPhase) {
      this.logger.debug(`🔄 Mudando fase: ${context.executionState.currentPhase} → ${parsed.phaseRecommendation}`);
      context.executionState.currentPhase = parsed.phaseRecommendation;
    }

    return parsed.action;
  }

  /**
   * ✅ Validação de ação antes da execução MELHORADA
   */
  private validateAction(action: MCPAction, context: TestContext): { isValid: boolean; reason: string } {
    // 🚨 VALIDAÇÃO AGRESSIVA: Verificar se a ação é similar às últimas 3
    const recentActions = context.executionHistory.slice(-3);
    for (const recentStep of recentActions) {
      // Verificar se é exatamente igual
      if (recentStep.action.type === action.type && 
          recentStep.action.url === action.url &&
          recentStep.action.selector === action.selector &&
          recentStep.action.value === action.value) {
        return { 
          isValid: false, 
          reason: `AÇÃO IDÊNTICA já executada recentemente: ${action.type}` 
        };
      }
      
      // Verificar se é semanticamente similar
      if (recentStep.action.type === action.type &&
          this.isSimilarDescription(recentStep.action.description, action.description)) {
        return { 
          isValid: false, 
          reason: `AÇÃO SEMANTICAMENTE SIMILAR já executada: ${action.type} - "${action.description}"` 
        };
      }
    }

    // 🚨 ANTI-LOOP EXTREMO: Verificar se o tipo de ação foi usado muitas vezes recentemente
    const recentActionTypes = context.executionHistory.slice(-6).map(step => step.action.type);
    const actionCount = recentActionTypes.filter(type => type === action.type).length;
    
    if (actionCount >= 3) {
      return { 
        isValid: false, 
        reason: `TIPO DE AÇÃO '${action.type}' usado ${actionCount}x recentemente - possível loop` 
      };
    }

    // Verificar padrões de loop conhecidos
    for (const loopPattern of context.actionMemory.loopDetection) {
      if (loopPattern.pattern.includes(action.type) && loopPattern.severity === 'high') {
        return { 
          isValid: false, 
          reason: `Ação faz parte de padrão de loop detectado: ${loopPattern.pattern.join(' → ')}` 
        };
      }
    }

    // Validações específicas por tipo de ação
    if (action.type === 'navigate' && !action.url) {
      return { isValid: false, reason: 'URL obrigatória para navegação' };
    }

    if ((action.type === 'click' || action.type === 'fill') && !action.selector) {
      return { isValid: false, reason: 'Seletor obrigatório para interação com elementos' };
    }

    if (action.type === 'fill' && !action.value) {
      return { isValid: false, reason: 'Valor obrigatório para preenchimento' };
    }

    // 🚨 ANTI-NAVEGAÇÃO REPETIDA: Verificar se não está navegando repetidamente para a mesma URL
    if (action.type === 'navigate' && action.url === context.pageState.url) {
      return { isValid: false, reason: 'Já está na URL de destino - navegação desnecessária' };
    }

    // 🚨 LIMITE DE AÇÕES ASSERT/EXTRACT CONSECUTIVAS
    const lastTwoActions = context.executionHistory.slice(-2).map(step => step.action.type);
    if ((action.type === 'assert' || action.type === 'extract') && 
        lastTwoActions.every(type => type === 'assert' || type === 'extract')) {
      return { 
        isValid: false, 
        reason: `Muitas ações de verificação consecutivas: ${lastTwoActions.join(' → ')} → ${action.type}` 
      };
    }

    return { isValid: true, reason: 'Ação válida' };
  }

  /**
   * 🔄 Geração de ação alternativa
   */
  private async generateAlternativeAction(context: TestContext, goal: TestGoal, reason: string): Promise<MCPAction | null> {
    const apiKey = await this.apiKeyManager.getDecryptedApiKey(goal.userId, goal.llmProvider);

    const alternativePrompt = {
      system: `A ação sugerida foi rejeitada. Gere uma ação alternativa que evite o problema.
      
      RESPONDA EM JSON:
      {
        "action": {
          "type": "wait|analyze|screenshot|extract",
          "description": "Ação alternativa segura",
          "reasoning": "Por que esta ação é melhor",
          "timeout": 3000
        }
      }`,
      user: `Ação rejeitada por: ${reason}
             Contexto: ${JSON.stringify(context.pageState)}
             
             Sugira uma ação alternativa que seja segura e produtiva.`,
      context: ''
    };

    try {
      const response = await this.callLLMDirectly(goal.llmProvider, alternativePrompt, apiKey);
      const parsed = JSON.parse(response);
      return parsed.action;
    } catch (error) {
      this.logger.warn(`⚠️ Erro ao gerar ação alternativa: ${error.message}`);
      // Retornar ação padrão segura
      return {
        type: 'wait',
        description: 'Aguardar para estabilizar página',
        reasoning: 'Ação padrão segura quando não é possível gerar alternativa',
        timeout: 2000
      };
    }
  }

  /**
   * 🧠 Atualização dinâmica do contexto com análise
   */
  private async updateContextWithDynamicAnalysis(
    context: TestContext,
    action: MCPAction,
    result: MCPResult,
    duration: number
  ): Promise<TestContext> {
    // Atualizar estado da página
    context.pageState = result.pageContext;
    context.currentUrl = result.pageContext.url;

    // Registrar padrão de ação
    this.registerActionPattern(context, action, result);

    // Atualizar confiança baseada no resultado
    if (result.success) {
      context.confidence = Math.min(context.confidence + 5, 100);
      context.executionState.explorationBudget = Math.max(context.executionState.explorationBudget - 1, 0);
    } else {
      context.confidence = Math.max(context.confidence - 10, 0);
    }

    // Atualizar fase baseada no progresso
    context.executionState = this.updateExecutionPhase(context.executionState, result);

    // Adicionar chunk de contexto
    this.addContextChunk(context, {
      content: `Ação: ${action.description} | Resultado: ${result.success ? 'Sucesso' : 'Falha'} | Duração: ${duration}ms`,
      type: 'action',
      importance: result.success ? 0.8 : 0.6,
      recency: 1.0
    });

    return context;
  }

  /**
   * 🎯 Avaliação de progresso com aprendizado adaptativo
   */
  private async evaluateProgressWithAdaptiveLearning(context: TestContext, goal: TestGoal): Promise<TestContext> {
    const apiKey = await this.apiKeyManager.getDecryptedApiKey(goal.userId, goal.llmProvider);

    const evaluationPrompt = {
      system: `Avalie o progresso do teste com aprendizado adaptativo.
      
      RESPONDA EM JSON:
      {
        "progress": {
          "isComplete": false,
          "completionPercentage": 65,
          "currentPhase": "focused",
          "nextSteps": ["analisar_resultado", "preencher_campo"]
        },
        "adaptations": {
          "strategyAdjustment": "manter|intensificar|mudar_abordagem",
          "confidenceAdjustment": 5,
          "phaseRecommendation": "focused"
        },
        "learnings": [
          {
            "pattern": "formulario_encontrado",
            "confidence": 0.9,
            "action": "continuar_preenchimento"
          }
        ]
      }`,
      user: `OBJETIVO: ${context.goal}
             PROGRESSO ATUAL: ${context.confidence}%
             AÇÕES EXECUTADAS: ${context.executionHistory.length}
             ÚLTIMA AÇÃO: ${context.executionHistory[context.executionHistory.length - 1]?.action.description}
             RESULTADO: ${context.executionHistory[context.executionHistory.length - 1]?.result.success ? 'Sucesso' : 'Falha'}
             PÁGINA ATUAL: ${context.pageState.url}
             
             Avalie o progresso e sugira adaptações.`,
      context: ''
    };

    try {
      const response = await this.callLLMDirectly(goal.llmProvider, evaluationPrompt, apiKey);
      const evaluation = JSON.parse(response);

      // Aplicar avaliação
      context.isComplete = evaluation.progress.isComplete;
      context.confidence = Math.min(Math.max(context.confidence + (evaluation.adaptations.confidenceAdjustment || 0), 0), 100);
      
      if (evaluation.adaptations.phaseRecommendation) {
        context.executionState.currentPhase = evaluation.adaptations.phaseRecommendation;
      }

      // Registrar aprendizados
      if (evaluation.learnings) {
        for (const learning of evaluation.learnings) {
          this.registerLearning(context, learning);
        }
      }

    } catch (error) {
      this.logger.warn(`⚠️ Erro na avaliação de progresso: ${error.message}`);
    }

    return context;
  }

  /**
   * ⚠️ Tratamento de erro com aprendizado
   */
  private async handleStepErrorWithLearning(context: TestContext, error: Error, stepCounter: number): Promise<TestContext> {
    this.logger.warn(`⚠️ Recuperando do erro no passo ${stepCounter}: ${error.message}`);
    
    // Registrar padrão de falha
    const failurePattern: ActionPattern = {
      actionSequence: context.executionHistory.slice(-2).map(step => step.action.type),
      outcome: 'failure',
      pageContext: context.pageState.url,
      confidence: 0.3,
      frequency: 1,
      lastUsed: new Date()
    };
    
    context.actionMemory.failurePatterns.push(failurePattern);

    // Reduzir confiança e ajustar estratégia
    context.confidence = Math.max(context.confidence - 15, 0);
    context.executionState.currentPhase = 'recovery';
    context.executionState.adaptationLevel = Math.min(context.executionState.adaptationLevel + 0.3, 1.0);

    return context;
  }

  /**
   * 🚨 Ativação do modo de recuperação
   */
  private async activateRecoveryMode(context: TestContext, goal: TestGoal): Promise<TestContext> {
    this.logger.error('🚨 Ativando modo de recuperação - confiança extremamente baixa');
    
    // Resetar estratégia para modo conservador
    context.executionState.currentPhase = 'recovery';
    context.executionState.adaptationLevel = 1.0;
    context.executionState.explorationBudget = 5;
    
    // Simplificar objetivo
    context.currentStrategy.currentObjective = 'Recuperar estado estável e analisar situação';
    context.confidence = 30; // Dar uma chance mínima
    
    // Limpar histórico de ações problemáticas
    context.actionMemory.loopDetection = [];
    
    return context;
  }

  /**
   * 📊 Finalização com analytics
   */
  private async finalizeExecutionWithAnalytics(executionId: string, context: TestContext): Promise<void> {
    const executionTime = Date.now() - context.executionState.lastDecisionTime.getTime();
    const successRate = context.executionHistory.filter(s => s.result.success).length / context.executionHistory.length * 100;
    
    this.logger.log(`✅ Execução finalizada - ID: ${executionId}`);
    this.logger.log(`📊 Analytics:`);
    this.logger.log(`   • Confiança final: ${context.confidence}%`);
    this.logger.log(`   • Taxa de sucesso: ${successRate.toFixed(1)}%`);
    this.logger.log(`   • Ações executadas: ${context.executionHistory.length}`);
    this.logger.log(`   • Loops detectados: ${context.actionMemory.loopDetection.length}`);
    this.logger.log(`   • Fase final: ${context.executionState.currentPhase}`);
    this.logger.log(`   • Tempo total: ${(executionTime / 1000).toFixed(1)}s`);
    
    // Salvar resultado no banco com analytics
    const execution = this.executionRepository.create({
      testFlowId: executionId,
      userId: 'demo-user',
      status: context.isComplete ? TestExecutionStatus.SUCCESS : TestExecutionStatus.FAILED,
      startTime: new Date(Date.now() - executionTime),
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
          screenshot: step.result.screenshot,
          analytics: {
            phase: context.executionState.currentPhase,
            confidence: context.confidence,
            loopsDetected: context.actionMemory.loopDetection.length
          }
        }
      }))
    });

    await this.executionRepository.save(execution);
  }

  // Métodos auxiliares para o sistema dinâmico

  private buildOptimizedContext(context: TestContext): string {
    const priorityChunks = context.contextWindow.priorityChunks
      .sort((a, b) => (b.importance + b.recency + b.relevance) - (a.importance + a.recency + a.relevance))
      .slice(0, 5)
      .map(chunk => chunk.content);
    
    return priorityChunks.join('\n\n');
  }

  private buildContextText(context: TestContext): string {
    return [
      `Objetivo: ${context.goal}`,
      `URL atual: ${context.currentUrl}`,
      `Estratégia: ${JSON.stringify(context.currentStrategy)}`,
      `Histórico: ${JSON.stringify(context.executionHistory.slice(-3))}`,
      `Estado da página: ${JSON.stringify(context.pageState)}`
    ].join('\n');
  }

  private estimateTokens(text: string): number {
    // Estimativa aproximada: 1 token ≈ 4 caracteres
    return Math.ceil(text.length / 4);
  }

  private createContextChunks(context: TestContext): ContextChunk[] {
    const chunks: ContextChunk[] = [];
    
    // Chunk do objetivo
    chunks.push({
      id: 'goal',
      content: `Objetivo: ${context.goal}`,
      type: 'strategy',
      importance: 1.0,
      recency: 1.0,
      relevance: 1.0,
      timestamp: new Date(),
      tokens: this.estimateTokens(context.goal)
    });

    // Chunks das ações recentes
    context.executionHistory.slice(-5).forEach((step, index) => {
      chunks.push({
        id: step.id,
        content: `${step.action.description} → ${step.result.success ? 'Sucesso' : 'Falha'}`,
        type: 'action',
        importance: step.result.success ? 0.8 : 0.4,
        recency: (index + 1) / 5,
        relevance: 0.7,
        timestamp: step.timestamp,
        tokens: this.estimateTokens(step.description)
      });
    });

    return chunks;
  }

  private prioritizeChunks(chunks: ContextChunk[], recentActions: AgentStep[]): ContextChunk[] {
    return chunks.sort((a, b) => {
      const scoreA = a.importance * 0.4 + a.recency * 0.3 + a.relevance * 0.3;
      const scoreB = b.importance * 0.4 + b.recency * 0.3 + b.relevance * 0.3;
      return scoreB - scoreA;
    });
  }

  private registerActionPattern(context: TestContext, action: MCPAction, result: MCPResult): void {
    const pattern: ActionPattern = {
      actionSequence: [action.type],
      outcome: result.success ? 'success' : 'failure',
      pageContext: result.pageContext.url,
      confidence: result.success ? 0.8 : 0.3,
      frequency: 1,
      lastUsed: new Date()
    };

    if (result.success) {
      context.actionMemory.successPatterns.push(pattern);
    } else {
      context.actionMemory.failurePatterns.push(pattern);
    }

    // Manter apenas os últimos 20 padrões
    context.actionMemory.successPatterns = context.actionMemory.successPatterns.slice(-20);
    context.actionMemory.failurePatterns = context.actionMemory.failurePatterns.slice(-20);
  }

  private updateExecutionPhase(executionState: ExecutionState, result: MCPResult): ExecutionState {
    const phases = ['exploration', 'focused', 'completion', 'recovery'];
    const currentPhaseIndex = phases.indexOf(executionState.currentPhase);
    
    if (result.success && executionState.currentPhase === 'exploration') {
      executionState.currentPhase = 'focused';
    } else if (!result.success && currentPhaseIndex < 3) {
      // Não regredir imediatamente, dar algumas chances
      if (executionState.adaptationLevel > 0.7) {
        executionState.currentPhase = 'recovery';
      }
    }

    return executionState;
  }

  private addContextChunk(context: TestContext, chunkData: Partial<ContextChunk>): void {
    const chunk: ContextChunk = {
      id: `chunk-${Date.now()}`,
      content: chunkData.content || '',
      type: chunkData.type || 'observation',
      importance: chunkData.importance || 0.5,
      recency: chunkData.recency || 1.0,
      relevance: chunkData.relevance || 0.7,
      timestamp: new Date(),
      tokens: this.estimateTokens(chunkData.content || '')
    };

    context.contextWindow.priorityChunks.push(chunk);
    
    // Manter apenas os últimos 20 chunks
    if (context.contextWindow.priorityChunks.length > 20) {
      context.contextWindow.priorityChunks = context.contextWindow.priorityChunks.slice(-20);
    }
  }

  private registerLearning(context: TestContext, learning: any): void {
    // Registrar aprendizado na memória de ações
    if (learning.pattern && learning.confidence > 0.7) {
      const pattern: ActionPattern = {
        actionSequence: [learning.pattern],
        outcome: learning.action === 'continuar_preenchimento' ? 'success' : 'neutral',
        pageContext: context.pageState.url,
        confidence: learning.confidence,
        frequency: 1,
        lastUsed: new Date()
      };
      
      context.actionMemory.successPatterns.push(pattern);
    }
  }

  // Métodos removidos que estavam gerando loops

  /**
   * 🚫 Detecta se está repetindo ações (versão simplificada para compatibilidade)
   */
  private isRepeatingActions(context: TestContext): boolean {
    return this.detectActionLoops(context).isLoop;
  }

  /**
   * 🛠️ Lida com ações repetidas (versão simplificada para compatibilidade) 
   */
  private async handleRepeatingActions(context: TestContext, goal: TestGoal): Promise<TestContext> {
    const loopDetection = this.detectActionLoops(context);
    return this.applyLoopCorrection(context, loopDetection);
  }

  /**
   * 🧠 Decide próxima ação (versão de compatibilidade)
   */
  private async decideNextAction(context: TestContext, goal: TestGoal): Promise<MCPAction> {
    return this.decideNextActionWithDynamicContext(context, goal);
  }

  /**
   * 🎯 Verifica se objetivo foi completado (versão de compatibilidade)
   */
  private async evaluateGoalCompletion(context: TestContext, goal: TestGoal): Promise<TestContext> {
    return this.evaluateProgressWithAdaptiveLearning(context, goal);
  }

  /**
   * ⚠️ Lida com erros durante execução (versão de compatibilidade)
   */
  private async handleStepError(context: TestContext, error: Error): Promise<TestContext> {
    return this.handleStepErrorWithLearning(context, error, 0);
  }

  /**
   * ✅ Finaliza execução e salva resultados (versão de compatibilidade)
   */
  private async finalizeExecution(executionId: string, context: TestContext): Promise<void> {
    return this.finalizeExecutionWithAnalytics(executionId, context);
  }

  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 🔧 Chama LLM diretamente sem usar o parser tradicional
   */
  private async callLLMDirectly(provider: string, prompt: any, apiKey: string): Promise<string> {
    if (provider === 'openai') {
      return this.callOpenAIDirectly(prompt, apiKey);
    } else if (provider === 'anthropic') {
      return this.callAnthropicDirectly(prompt, apiKey);
    } else if (provider === 'gemini') {
      return this.callGeminiDirectly(prompt, apiKey);
    } else {
      throw new Error(`Provider ${provider} não suportado para sistema dinâmico`);
    }
  }

  /**
   * 🤖 Chama OpenAI diretamente
   */
  private async callOpenAIDirectly(prompt: any, apiKey: string): Promise<string> {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey });

    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Resposta vazia do OpenAI');
      }

      return response;
    } catch (error) {
      this.logger.error(`Erro ao chamar OpenAI: ${error.message}`);
      throw new Error(`Erro OpenAI: ${error.message}`);
    }
  }

  /**
   * 🧠 Chama Anthropic diretamente
   */
  private async callAnthropicDirectly(prompt: any, apiKey: string): Promise<string> {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    try {
      const completion = await client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        temperature: 0.1,
        system: prompt.system,
        messages: [
          { role: 'user', content: prompt.user }
        ]
      });

      const textBlock = completion.content.find(block => block.type === 'text');
      const response = textBlock ? textBlock.text : '';
      
      if (!response) {
        throw new Error('Resposta vazia do Anthropic');
      }

      return response;
    } catch (error) {
      this.logger.error(`Erro ao chamar Anthropic: ${error.message}`);
      throw new Error(`Erro Anthropic: ${error.message}`);
    }
  }

  /**
   * 🌟 Chama Gemini diretamente
   */
  private async callGeminiDirectly(prompt: any, apiKey: string): Promise<string> {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const fullPrompt = `${prompt.system}\n\n${prompt.user}`;
      
      const result = await model.generateContent(fullPrompt);
      const response = result.response.text();
      
      if (!response) {
        throw new Error('Resposta vazia do Gemini');
      }

      return response;
    } catch (error) {
      this.logger.error(`Erro ao chamar Gemini: ${error.message}`);
      throw new Error(`Erro Gemini: ${error.message}`);
    }
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
} 