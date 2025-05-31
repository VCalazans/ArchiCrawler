export declare class LLMProviderConfig {
    id: string;
    provider: string;
    name: string;
    description: string;
    supportedModels: string[];
    defaultSettings: {
        temperature?: number;
        maxTokens?: number;
        timeout?: number;
    };
    pricing: {
        inputTokenCost?: number;
        outputTokenCost?: number;
        currency?: string;
    };
    isActive: boolean;
    apiVersion: string;
    createdAt: Date;
    updatedAt: Date;
}
