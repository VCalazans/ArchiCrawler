import { OnModuleDestroy } from '@nestjs/common';
export interface MCPServerConfig {
    name: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
    configPath?: string;
    description?: string;
}
export declare class MCPManagerService implements OnModuleDestroy {
    private readonly logger;
    private servers;
    onModuleDestroy(): Promise<void>;
    registerServer(config: MCPServerConfig): void;
    startServer(serverName: string): Promise<void>;
    stopServer(serverName: string): Promise<void>;
    stopAllServers(): Promise<void>;
    getRegisteredServers(): MCPServerConfig[];
    isServerRunning(serverName: string): boolean;
    sendNotification(serverName: string, method: string, params?: any): Promise<void>;
    sendRequest(serverName: string, method: string, params?: any): Promise<any>;
    listTools(serverName: string): Promise<any>;
    callTool(serverName: string, toolName: string, arguments_: any): Promise<any>;
    private handleServerOutput;
    private handleServerResponse;
}
