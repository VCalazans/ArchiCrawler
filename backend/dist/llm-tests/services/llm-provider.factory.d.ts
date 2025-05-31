import { OpenAIProvider } from '../providers/openai.provider';
import { AnthropicProvider } from '../providers/anthropic.provider';
import { GeminiProvider } from '../providers/gemini.provider';
import { LLMProvider } from '../interfaces/llm-provider.interface';
export declare class LLMProviderFactory {
    private readonly openaiProvider;
    private readonly anthropicProvider;
    private readonly geminiProvider;
    private readonly logger;
    constructor(openaiProvider: OpenAIProvider, anthropicProvider: AnthropicProvider, geminiProvider: GeminiProvider);
    createProvider(providerName: string): LLMProvider;
    getAvailableProviders(): Array<{
        name: string;
        models: string[];
        description: string;
    }>;
    validateProviderSupport(providerName: string): Promise<boolean>;
    getProviderByName(providerName: string): LLMProvider | null;
    getSupportedProviderNames(): string[];
}
