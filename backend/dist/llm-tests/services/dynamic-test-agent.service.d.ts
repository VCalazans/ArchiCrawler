import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { GeneratedTest } from '../entities/generated-test.entity';
import { TestExecution } from '../../entities/test-execution.entity';
import { LLMProviderFactory } from './llm-provider.factory';
import { ApiKeyManagerService } from './api-key-manager.service';
import { RealtimeMCPBridge } from './realtime-mcp-bridge.service';
import { IntelligentContextManager } from './intelligent-context-manager.service';
import { PageChange, PerformanceMetrics, FormInfo, ButtonInfo, LinkInfo } from '../interfaces/dynamic-agent.interface';
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
    reasoning: string;
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
    llmThoughts: string;
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
export declare class DynamicTestAgentService {
    private generatedTestRepository;
    private executionRepository;
    private llmProviderFactory;
    private apiKeyManager;
    private mcpBridge;
    private contextManager;
    private readonly logger;
    private executionSubjects;
    constructor(generatedTestRepository: Repository<GeneratedTest>, executionRepository: Repository<TestExecution>, llmProviderFactory: LLMProviderFactory, apiKeyManager: ApiKeyManagerService, mcpBridge: RealtimeMCPBridge, contextManager: IntelligentContextManager);
    executeTestGoal(goal: TestGoal): Promise<Observable<AgentStep>>;
    private executeGoalInBackground;
    private interpretTestGoal;
    private decideNextAction;
    private evaluateGoalCompletion;
    private handleStepError;
    private finalizeExecution;
    stopExecution(executionId: string): Promise<void>;
    private generateExecutionId;
    private wait;
}
