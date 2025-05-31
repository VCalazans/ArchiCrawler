import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserApiKey } from '../entities/user-api-key.entity';
export declare class ApiKeyManagerService {
    private userApiKeyRepository;
    private configService;
    private readonly logger;
    private readonly encryptionKey;
    constructor(userApiKeyRepository: Repository<UserApiKey>, configService: ConfigService);
    encrypt(text: string): string;
    decrypt(encryptedText: string): string;
    storeApiKey(userId: string, provider: string, apiKey: string): Promise<void>;
    getDecryptedApiKey(userId: string, provider: string): Promise<string | null>;
    deleteApiKey(userId: string, provider: string): Promise<void>;
    listUserProviders(userId: string): Promise<string[]>;
    validateApiKey(userId: string, provider: string): Promise<boolean>;
}
