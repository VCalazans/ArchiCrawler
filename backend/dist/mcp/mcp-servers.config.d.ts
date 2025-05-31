import { MCPServerConfig } from './mcp-manager.service';
export interface MCPNetworkServerConfig extends MCPServerConfig {
    networkMode?: 'stdio' | 'tcp' | 'http';
    port?: number;
    host?: string;
}
export declare const MCP_SERVERS_CONFIG: MCPNetworkServerConfig[];
export declare const getServerConfig: (serverName: string) => MCPNetworkServerConfig | undefined;
export declare const getAvailableServers: () => string[];
export declare const getNetworkServers: () => MCPNetworkServerConfig[];
