import { ApiKeyManagerService } from '../services/api-key-manager.service';
import { LLMProviderFactory } from '../services/llm-provider.factory';
import { StoreApiKeyDto } from '../dto/api-key.dto';
export declare class ApiKeysController {
    private readonly apiKeyManager;
    private readonly providerFactory;
    constructor(apiKeyManager: ApiKeyManagerService, providerFactory: LLMProviderFactory);
    storeApiKey(dto: StoreApiKeyDto, req: any): Promise<{
        success: boolean;
        message: any;
        provider: string;
    }>;
    listProviders(req: any): Promise<{
        success: boolean;
        data: {
            configured: string[];
            available: {
                name: string;
                description: string;
                models: string[];
            }[];
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    validateApiKey(provider: string, req: any): Promise<{
        success: boolean;
        data: {
            provider: string;
            isValid: boolean;
            message: string;
        };
        message?: undefined;
        provider?: undefined;
    } | {
        success: boolean;
        message: any;
        provider: string;
        data?: undefined;
    }>;
    deleteApiKey(provider: string, req: any): Promise<{
        success: boolean;
        message: any;
        provider: string;
    }>;
    getApiKeysStatus(req: any): Promise<{
        success: boolean;
        data: {
            provider: string;
            isValid: boolean;
            lastChecked: string;
        }[];
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
}
