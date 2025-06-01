import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { GeneratedTest } from '../entities/generated-test.entity';
import { TestExecution } from '../../entities/test-execution.entity';
import { LLMProviderFactory } from './llm-provider.factory';
import { ApiKeyManagerService } from './api-key-manager.service';
import { PageChange, PerformanceMetrics, FormInfo, ButtonInfo, LinkInfo } from '../interfaces/dynamic-agent.interface';
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
    llmThoughts: string;
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
    importance: number;
    recency: number;
    relevance: number;
    semanticEmbedding?: number[];
    timestamp: Date;
    tokens: number;
}
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
export interface ExecutionState {
    currentPhase: 'exploration' | 'focused' | 'completion' | 'recovery';
    adaptationLevel: number;
    patternConfidence: number;
    explorationBudget: number;
    lastDecisionTime: Date;
    decisionFactors: DecisionFactor[];
}
export interface DecisionFactor {
    factor: string;
    weight: number;
    value: number;
    reasoning: string;
}
export declare class DynamicTestAgentService {
    private generatedTestRepository;
    private executionRepository;
    private llmProviderFactory;
    private apiKeyManager;
    private readonly logger;
    private executionSubjects;
    constructor(generatedTestRepository: Repository<GeneratedTest>, executionRepository: Repository<TestExecution>, llmProviderFactory: LLMProviderFactory, apiKeyManager: ApiKeyManagerService);
    executeTestGoal(goal: TestGoal): Promise<Observable<AgentStep>>;
    private executeGoalInBackground;
    private interpretTestGoalWithDynamicContext;
    private optimizeContextWindow;
    private detectActionLoops;
    private isSimilarDescription;
    private calculateLoopSeverity;
    private applyLoopCorrection;
    private executeActionWithAdaptiveTimeout;
    private calculateAdaptiveWaitTime;
    private initializeContextWindow;
    private initializeActionMemory;
    private initializeExecutionState;
    private decideNextActionWithDynamicContext;
    private validateAction;
    private generateAlternativeAction;
    private updateContextWithDynamicAnalysis;
    private evaluateProgressWithAdaptiveLearning;
    private handleStepErrorWithLearning;
    private activateRecoveryMode;
    private finalizeExecutionWithAnalytics;
    private buildOptimizedContext;
    private buildContextText;
    private estimateTokens;
    private createContextChunks;
    private prioritizeChunks;
    private registerActionPattern;
    private updateExecutionPhase;
    private addContextChunk;
    private registerLearning;
    private isRepeatingActions;
    private handleRepeatingActions;
    private decideNextAction;
    private evaluateGoalCompletion;
    private handleStepError;
    private finalizeExecution;
    private generateExecutionId;
    private wait;
    private callLLMDirectly;
    private callOpenAIDirectly;
    private callAnthropicDirectly;
    private callGeminiDirectly;
    stopExecution(executionId: string): Promise<void>;
}
