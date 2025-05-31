import { LLMProvider, TestPrompt, GeneratedTestResult } from '../interfaces/llm-provider.interface';
export declare abstract class BaseLLMProvider implements LLMProvider {
    abstract readonly name: string;
    abstract readonly apiVersion: string;
    abstract generateTest(prompt: TestPrompt, apiKey: string): Promise<GeneratedTestResult>;
    abstract validateApiKey(apiKey: string): Promise<boolean>;
    abstract getSupportedModels(): string[];
    estimateTokens(prompt: string): number;
    protected formatPromptForMCP(prompt: TestPrompt): string;
    protected parseResponse(response: string): GeneratedTestResult;
    private generateReadableTestCode;
    protected handleApiError(error: any, providerName: string): Error;
}
