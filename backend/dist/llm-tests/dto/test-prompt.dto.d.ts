export declare class TestPromptDto {
    system: string;
    user: string;
    examples?: any[];
    context?: string;
}
export declare class PromptTemplateDto {
    name: string;
    description: string;
    testType: string;
    systemPrompt: string;
    userPromptTemplate: string;
    examples?: any[];
}
