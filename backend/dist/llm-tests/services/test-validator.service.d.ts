import { ValidationResult } from '../interfaces/test-generation.interface';
import { GeneratedTestResult, MCPCommand } from '../interfaces/llm-provider.interface';
export declare class TestValidatorService {
    private readonly logger;
    validateGeneratedTest(generatedTest: GeneratedTestResult): Promise<ValidationResult>;
    private validateBasicStructure;
    private validateMCPCommands;
    private validateTestCode;
    private validateMetadata;
    private isValidUrl;
    private isValidSelector;
    private calculateScore;
    validateMCPCommandStructure(command: MCPCommand): {
        isValid: boolean;
        errors: string[];
    };
}
