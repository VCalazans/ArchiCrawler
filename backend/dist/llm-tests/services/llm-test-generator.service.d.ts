import { Repository } from 'typeorm';
import { GeneratedTest } from '../entities/generated-test.entity';
import { TestGenerationRequest } from '../interfaces/test-generation.interface';
import { LLMProviderFactory } from './llm-provider.factory';
import { TestPromptBuilderService } from './test-prompt-builder.service';
import { ApiKeyManagerService } from './api-key-manager.service';
import { TestValidatorService } from './test-validator.service';
export declare class LLMTestGeneratorService {
    private generatedTestRepository;
    private llmProviderFactory;
    private promptBuilder;
    private apiKeyManager;
    private testValidator;
    private readonly logger;
    constructor(generatedTestRepository: Repository<GeneratedTest>, llmProviderFactory: LLMProviderFactory, promptBuilder: TestPromptBuilderService, apiKeyManager: ApiKeyManagerService, testValidator: TestValidatorService);
    generateTest(request: TestGenerationRequest): Promise<GeneratedTest>;
    private validateRequest;
    private generateTestName;
    getGeneratedTests(userId: string, filters?: {
        testType?: string;
        status?: string;
        llmProvider?: string;
        limit?: number;
    }): Promise<GeneratedTest[]>;
    getTestById(id: string, userId: string): Promise<GeneratedTest>;
    updateTestStatus(id: string, userId: string, status: string): Promise<GeneratedTest>;
    deleteTest(id: string, userId: string): Promise<void>;
    getTestStatistics(userId: string): Promise<{
        total: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        byProvider: Record<string, number>;
    }>;
    regenerateTest(id: string, userId: string): Promise<GeneratedTest>;
}
