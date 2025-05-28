import { OnModuleInit } from '@nestjs/common';
import { MCPManagerService } from './mcp-manager.service';
declare class CallToolDto {
    serverName: string;
    toolName: string;
    arguments: any;
}
export declare class MCPController implements OnModuleInit {
    private readonly mcpManager;
    constructor(mcpManager: MCPManagerService);
    onModuleInit(): Promise<void>;
    getServers(): {
        success: boolean;
        servers: {
            name: string;
            description: string;
            isRunning: boolean;
            networkMode: any;
            connectionInfo: {
                type: string;
                message: string;
                apiUrl: string;
                host?: undefined;
                port?: undefined;
                url?: undefined;
            } | {
                type: string;
                host: any;
                port: any;
                url: string;
                message: string;
                apiUrl?: undefined;
            };
        }[];
    };
    getConnectionsInfo(): {
        success: boolean;
        message: string;
        connections: {
            name: string;
            description: string;
            isRunning: boolean;
            connectionType: "stdio" | "tcp" | "http";
            host: string;
            port: number;
            url: string;
            clientConfig: {
                claude_desktop: {
                    mcpServers: {
                        [x: number]: {
                            command: string;
                            args: any[];
                        };
                    };
                };
                cursor: {
                    mcp: {
                        servers: {
                            [x: number]: {
                                transport: string;
                                host: any;
                                port: any;
                            };
                        };
                    };
                };
                note?: undefined;
            } | {
                note: string;
                claude_desktop?: undefined;
                cursor?: undefined;
            };
        }[];
        instructions: {
            claude: string;
            cursor: string;
            generic: string;
        };
    };
    startServer(serverName: string): Promise<{
        success: boolean;
        message: string;
        connectionInfo: {
            type: string;
            message: string;
            apiUrl: string;
            host?: undefined;
            port?: undefined;
            url?: undefined;
        } | {
            type: string;
            host: any;
            port: any;
            url: string;
            message: string;
            apiUrl?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message?: undefined;
        connectionInfo?: undefined;
    }>;
    stopServer(serverName: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        message?: undefined;
    }>;
    getServerStatus(serverName: string): {
        success: boolean;
        serverName: string;
        isRunning: boolean;
        connectionInfo: {
            type: string;
            message: string;
            apiUrl: string;
            host?: undefined;
            port?: undefined;
            url?: undefined;
        } | {
            type: string;
            host: any;
            port: any;
            url: string;
            message: string;
            apiUrl?: undefined;
        };
    };
    listTools(serverName: string): Promise<{
        success: boolean;
        serverName: string;
        tools: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        serverName?: undefined;
        tools?: undefined;
    }>;
    callTool(callToolDto: CallToolDto): Promise<{
        success: boolean;
        serverName: string;
        toolName: string;
        result: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        serverName?: undefined;
        toolName?: undefined;
        result?: undefined;
    }>;
    playwrightNavigate(body: {
        url: string;
    }): Promise<{
        success: boolean;
        serverName: string;
        toolName: string;
        result: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        serverName?: undefined;
        toolName?: undefined;
        result?: undefined;
    }>;
    playwrightClick(body: {
        element: string;
    }): Promise<{
        success: boolean;
        serverName: string;
        toolName: string;
        result: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        serverName?: undefined;
        toolName?: undefined;
        result?: undefined;
    }>;
    playwrightFill(body: {
        element: string;
        text: string;
    }): Promise<{
        success: boolean;
        serverName: string;
        toolName: string;
        result: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        serverName?: undefined;
        toolName?: undefined;
        result?: undefined;
    }>;
    playwrightSnapshot(): Promise<{
        success: boolean;
        serverName: string;
        toolName: string;
        result: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        serverName?: undefined;
        toolName?: undefined;
        result?: undefined;
    }>;
    playwrightScreenshot(body: {
        filename?: string;
        raw?: boolean;
    }): Promise<{
        success: boolean;
        serverName: string;
        toolName: string;
        result: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        serverName?: undefined;
        toolName?: undefined;
        result?: undefined;
    }>;
    playwrightListTabs(): Promise<{
        success: boolean;
        serverName: string;
        toolName: string;
        result: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        serverName?: undefined;
        toolName?: undefined;
        result?: undefined;
    }>;
    playwrightClose(): Promise<{
        success: boolean;
        serverName: string;
        toolName: string;
        result: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        serverName?: undefined;
        toolName?: undefined;
        result?: undefined;
    }>;
    private getServerConnectionInfo;
    private generateClientConfig;
}
export {};
