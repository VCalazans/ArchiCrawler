import { MCPServerConfig } from './mcp-manager.service';

export interface MCPNetworkServerConfig extends MCPServerConfig {
  networkMode?: 'stdio' | 'tcp' | 'http';
  port?: number;
  host?: string;
}

export const MCP_SERVERS_CONFIG: MCPNetworkServerConfig[] = [
  {
    name: 'playwright',
    command: 'npx',
    args: ['@playwright/mcp', '--config', 'src/mcp/configs/playwright-config.json'],
    description: 'Servidor MCP oficial do Playwright para automação de navegadores',
    env: {
      NODE_ENV: 'production'
    },
    networkMode: 'stdio' // Modo interno (padrão)
  },
  // Configuração para exposição via TCP (para clientes MCP externos)
  {
    name: 'playwright-tcp',
    command: 'npx',
    args: ['@playwright/mcp', '--config', 'src/mcp/configs/playwright-config.json', '--transport', 'tcp', '--port', '3002'],
    description: 'Servidor MCP Playwright via TCP para clientes externos',
    env: {
      NODE_ENV: 'production'
    },
    networkMode: 'tcp',
    port: 3002,
    host: 'localhost'
  },
  // Exemplo de como adicionar outros servidores MCP no futuro:
  // {
  //   name: 'filesystem',
  //   command: 'npx',
  //   args: ['@modelcontextprotocol/server-filesystem', '/path/to/allowed/directory'],
  //   description: 'Servidor MCP para operações de sistema de arquivos',
  //   env: {
  //     NODE_ENV: 'production'
  //   }
  // },
  // {
  //   name: 'sqlite',
  //   command: 'npx',
  //   args: ['@modelcontextprotocol/server-sqlite', '--db-path', './database.sqlite'],
  //   description: 'Servidor MCP para operações com banco de dados SQLite',
  //   env: {
  //     NODE_ENV: 'production'
  //   }
  // },
  // {
  //   name: 'github',
  //   command: 'npx',
  //   args: ['@modelcontextprotocol/server-github'],
  //   description: 'Servidor MCP para integração com GitHub',
  //   env: {
  //     NODE_ENV: 'production',
  //     GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || ''
  //   }
  // }
];

export const getServerConfig = (serverName: string): MCPNetworkServerConfig | undefined => {
  return MCP_SERVERS_CONFIG.find(config => config.name === serverName);
};

export const getAvailableServers = (): string[] => {
  return MCP_SERVERS_CONFIG.map(config => config.name);
};

export const getNetworkServers = (): MCPNetworkServerConfig[] => {
  return MCP_SERVERS_CONFIG.filter(config => config.networkMode === 'tcp' || config.networkMode === 'http');
}; 