import { MCPManagerService } from '../mcp/mcp-manager.service';
export interface ExecutionStep {
    id: string;
    name: string;
    type: 'navigate' | 'click' | 'fill' | 'screenshot' | 'wait' | 'assert' | 'extract';
    config: Record<string, any>;
    timeout?: number;
    continueOnError?: boolean;
}
export interface ExecutionResult {
    success: boolean;
    stepId: string;
    duration: number;
    error?: string;
    data?: any;
}
export declare class PlaywrightExecutorService {
    private mcpManager;
    private readonly logger;
    constructor(mcpManager: MCPManagerService);
    executeStep(step: ExecutionStep): Promise<ExecutionResult>;
    private executeNavigate;
    private executeClick;
    private executeFill;
    private executeScreenshot;
    private executeWait;
    private executeAssert;
    private executeExtract;
    isPlaywrightAvailable(): Promise<boolean>;
    getAvailableTools(): Promise<any>;
    getPageSnapshot(): Promise<any>;
}
