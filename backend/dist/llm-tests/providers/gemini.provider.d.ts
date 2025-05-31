import { BaseLLMProvider } from './base-llm.provider';
import { TestPrompt, GeneratedTestResult } from '../interfaces/llm-provider.interface';
export declare class GeminiProvider extends BaseLLMProvider {
    readonly name = "gemini";
    readonly apiVersion = "v1";
    private readonly logger;
    constructor();
    private createClient;
    generateTest(prompt: TestPrompt, apiKey: string): Promise<GeneratedTestResult>;
    validateApiKey(apiKey: string): Promise<boolean>;
    getSupportedModels(): string[];
    generateTestWithModel(prompt: TestPrompt, apiKey: string, model?: string): Promise<GeneratedTestResult>;
    protected parseResponse(response: string): GeneratedTestResult;
}
