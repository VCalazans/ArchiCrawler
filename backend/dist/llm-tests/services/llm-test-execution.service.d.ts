import { Repository } from 'typeorm';
import { GeneratedTest } from '../entities/generated-test.entity';
import { TestExecution } from '../../entities/test-execution.entity';
import { PlaywrightMCPService } from '../../mcp/services/playwright-mcp.service';
export declare class LLMTestExecutionService {
    private readonly generatedTestRepository;
    private readonly executionRepository;
    private readonly playwrightMCPService;
    private readonly logger;
    constructor(generatedTestRepository: Repository<GeneratedTest>, executionRepository: Repository<TestExecution>, playwrightMCPService: PlaywrightMCPService);
    executeTest(testId: string, userId: string): Promise<TestExecution>;
    private convertLLMTestToMCPCommands;
    private parseJavaScriptCommands;
    private executeMCPCommand;
    private captureScreenshot;
    getTestExecutions(testId: string, userId: string): Promise<TestExecution[]>;
    getExecutionResult(executionId: string, userId: string): Promise<TestExecution>;
    stopExecution(executionId: string, userId: string): Promise<void>;
}
