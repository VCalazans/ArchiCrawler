import { TestContext, MCPAction, MCPResult } from './dynamic-test-agent.service';
export declare class IntelligentContextManager {
    private readonly logger;
    updateContextWithMCPResult(context: TestContext, action: MCPAction, result: MCPResult): Promise<TestContext>;
    private calculateConfidence;
    private evaluateStrategy;
    private checkForExpectedElements;
    private suggestNextActions;
    private generateThoughts;
}
