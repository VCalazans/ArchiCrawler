export interface ApiKeyManagerInterface {
    storeApiKey(userId: string, provider: string, apiKey: string): Promise<void>;
    getDecryptedApiKey(userId: string, provider: string): Promise<string | null>;
    deleteApiKey(userId: string, provider: string): Promise<void>;
    validateApiKey(userId: string, provider: string): Promise<boolean>;
    listUserProviders(userId: string): Promise<string[]>;
}
export interface EncryptionService {
    encrypt(text: string): string;
    decrypt(encryptedText: string): string;
}
export interface UsageStats {
    totalRequests: number;
    tokensUsed: number;
    estimatedCost: number;
    period: string;
    provider: string;
}
