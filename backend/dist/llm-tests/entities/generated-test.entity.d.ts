export declare class GeneratedTest {
    id: string;
    userId: string;
    name: string;
    description: string;
    targetUrl: string;
    testType: string;
    llmProvider: string;
    model: string;
    originalPrompt: any;
    generatedCode: any;
    mcpCommands: any;
    validationResult: any;
    status: 'draft' | 'validated' | 'active' | 'failed' | 'archived';
    executionHistory: any;
    metadata: {
        tokensUsed?: number;
        confidence?: number;
        estimatedDuration?: string;
        tags?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}
