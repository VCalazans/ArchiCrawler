import { MCPManagerService } from '../mcp/mcp-manager.service';
export interface TestStepConfig {
    id: string;
    name: string;
    type: string;
    config: any;
    timeout?: number;
    continueOnError?: boolean;
}
export declare class PlaywrightExecutorService {
    private readonly mcpManager;
    private readonly logger;
    constructor(mcpManager: MCPManagerService);
    executeStep(step: TestStepConfig): Promise<{
        success: boolean;
        result?: any;
        error?: string;
        duration: number;
    }>;
    private executeNavigate;
    private executeClick;
    private executeFill;
    private executeScreenshot;
    private executeWait;
    private executeAssert;
    private executeExtract;
    isPlaywrightAvailable(): Promise<boolean>;
    initializeBrowser(): Promise<void>;
    closeBrowser(): Promise<void>;
}
