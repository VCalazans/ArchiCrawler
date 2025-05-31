import { MCPManagerService } from '../mcp-manager.service';
export declare class PlaywrightMCPService {
    private readonly mcpManager;
    private readonly logger;
    private readonly SERVER_NAME;
    constructor(mcpManager: MCPManagerService);
    private ensurePlaywrightServerRunning;
    private callPlaywrightTool;
    navigate(url: string, options?: {
        waitUntil?: string;
        timeout?: number;
    }): Promise<any>;
    click(selector: string, options?: {
        timeout?: number;
    }): Promise<any>;
    fill(selector: string, value: string, options?: {
        timeout?: number;
    }): Promise<any>;
    hover(selector: string, options?: {
        timeout?: number;
    }): Promise<any>;
    select(selector: string, value: string, options?: {
        timeout?: number;
    }): Promise<any>;
    wait(milliseconds: number): Promise<any>;
    screenshot(name?: string, options?: {
        fullPage?: boolean;
    }): Promise<any>;
    pressKey(key: string, selector?: string): Promise<any>;
    getVisibleText(): Promise<any>;
    getVisibleHtml(): Promise<any>;
    goBack(): Promise<any>;
    goForward(): Promise<any>;
    close(): Promise<any>;
    evaluate(script: string): Promise<any>;
    drag(sourceSelector: string, targetSelector: string): Promise<any>;
    getConsoleLogs(options?: {
        type?: string;
        search?: string;
        limit?: number;
    }): Promise<any>;
    checkHealth(): Promise<{
        healthy: boolean;
        message: string;
    }>;
}
