import { PlaywrightMCPService } from '../../mcp/services/playwright-mcp.service';
import { MCPAction, MCPResult } from './dynamic-test-agent.service';
export declare class RealtimeMCPBridge {
    private readonly playwrightMCPService;
    private readonly logger;
    private previousPageState;
    constructor(playwrightMCPService: PlaywrightMCPService);
    executeActionWithAnalysis(action: MCPAction): Promise<MCPResult>;
    private executeRawMCPAction;
    private capturePageContext;
    private detectPageChanges;
    private getPerformanceMetrics;
    private captureSmartScreenshot;
    private detectForms;
    private detectButtons;
    private detectLinks;
    private detectErrors;
    private getLoadingState;
    private analyzePage;
    private getSafePageContext;
    private getSafePerformanceMetrics;
    private wait;
}
