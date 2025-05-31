export declare class GenerateTestDto {
    targetUrl: string;
    testDescription: string;
    testType: 'e2e' | 'visual' | 'performance' | 'accessibility';
    llmProvider: string;
    model?: string;
    additionalContext?: string;
}
export declare class UpdateTestDto {
    name?: string;
    description?: string;
    status?: 'draft' | 'validated' | 'active' | 'failed' | 'archived';
}
