import { MCPManagerService } from '../../../mcp/mcp-manager.service';
export declare class PlaywrightExecutorService {
    private readonly mcpManager;
    private readonly logger;
    constructor(mcpManager: MCPManagerService);
    executeStep(step: any): Promise<any>;
    private executeNavigate;
    private executeClick;
    private executeFill;
    private executeScreenshot;
    private executeWait;
    private executeAssert;
    private executeExtract;
}
