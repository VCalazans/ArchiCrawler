"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkServers = exports.getAvailableServers = exports.getServerConfig = exports.MCP_SERVERS_CONFIG = void 0;
const path = require("path");
exports.MCP_SERVERS_CONFIG = [
    {
        name: 'playwright',
        command: 'npx',
        args: ['@playwright/mcp', '--config', path.resolve(__dirname, 'configs', 'playwright-config.json')],
        description: 'Servidor MCP oficial do Playwright para automação de navegadores',
        env: {
            NODE_ENV: 'production'
        },
        networkMode: 'stdio'
    },
    {
        name: 'playwright-tcp',
        command: 'npx',
        args: ['@playwright/mcp', '--config', path.resolve(__dirname, 'configs', 'playwright-config.json'), '--transport', 'tcp', '--port', '3002'],
        description: 'Servidor MCP Playwright via TCP para clientes externos',
        env: {
            NODE_ENV: 'production'
        },
        networkMode: 'tcp',
        port: 3002,
        host: 'localhost'
    },
];
const getServerConfig = (serverName) => {
    return exports.MCP_SERVERS_CONFIG.find(config => config.name === serverName);
};
exports.getServerConfig = getServerConfig;
const getAvailableServers = () => {
    return exports.MCP_SERVERS_CONFIG.map(config => config.name);
};
exports.getAvailableServers = getAvailableServers;
const getNetworkServers = () => {
    return exports.MCP_SERVERS_CONFIG.filter(config => config.networkMode === 'tcp' || config.networkMode === 'http');
};
exports.getNetworkServers = getNetworkServers;
//# sourceMappingURL=mcp-servers.config.js.map