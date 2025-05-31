import { TestGenerationRequest } from '../interfaces/test-generation.interface';
import { TestPrompt } from '../interfaces/llm-provider.interface';
export declare class TestPromptBuilderService {
    buildPrompt(request: TestGenerationRequest): TestPrompt;
    private getSystemPrompt;
    private buildUserPrompt;
    private getTestTypeDescription;
    private getTypeSpecificInstructions;
    private getExamples;
    buildCustomPrompt(systemInstructions: string, userRequest: string, examples?: any[], context?: string): TestPrompt;
    validatePrompt(prompt: TestPrompt): {
        isValid: boolean;
        errors: string[];
    };
}
