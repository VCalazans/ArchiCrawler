import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';

export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  configPath?: string;
  description?: string;
}

interface MCPRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPServerInstance {
  config: MCPServerConfig;
  process: ChildProcess | null;
  requestId: number;
  pendingRequests: Map<string | number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>;
  isRunning: boolean;
}

@Injectable()
export class MCPManagerService implements OnModuleDestroy {
  private readonly logger = new Logger(MCPManagerService.name);
  private servers = new Map<string, MCPServerInstance>();

  async onModuleDestroy() {
    await this.stopAllServers();
  }

  /**
   * Registra um novo servidor MCP
   */
  registerServer(config: MCPServerConfig): void {
    this.servers.set(config.name, {
      config,
      process: null,
      requestId: 1,
      pendingRequests: new Map(),
      isRunning: false,
    });
    this.logger.log(`Servidor MCP registrado: ${config.name}`);
  }

  /**
   * Inicia um servidor MCP específico
   */
  async startServer(serverName: string): Promise<void> {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`Servidor MCP não encontrado: ${serverName}`);
    }

    if (server.isRunning) {
      this.logger.warn(`Servidor ${serverName} já está rodando`);
      return;
    }

    this.logger.log(`Iniciando servidor MCP: ${serverName}`);

    const env = { ...process.env, ...server.config.env };
    
    // Ajustar comando para Windows
    const isWindows = process.platform === 'win32';
    const command = server.config.command === 'npx' && isWindows 
      ? 'npx.cmd' 
      : server.config.command;

    server.process = spawn(command, server.config.args, {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: process.cwd(),
      env,
      shell: isWindows,
    });

    server.process.stdout?.on('data', (data) => {
      this.handleServerOutput(serverName, data);
    });

    server.process.on('error', (error) => {
      this.logger.error(`Erro no servidor ${serverName}:`, error);
      server.isRunning = false;
      
      if (error.message.includes('ENOENT')) {
        this.logger.error(`Comando não encontrado: ${command}. Verifique se está instalado.`);
      }
    });

    server.process.on('exit', (code) => {
      this.logger.log(`Servidor ${serverName} finalizado com código: ${code}`);
      server.isRunning = false;
      server.process = null;
    });

    server.isRunning = true;

    // Aguardar inicialização
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verificar se o processo ainda está rodando
    if (!server.process || server.process.killed) {
      server.isRunning = false;
      throw new Error(`Falha ao iniciar servidor ${serverName}`);
    }

    try {
      // Inicializar o servidor MCP
      await this.sendRequest(serverName, 'initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'archicrawler-mcp-manager',
          version: '1.0.0'
        }
      });
    } catch (error) {
      this.logger.error(`Erro na inicialização do servidor ${serverName}:`, error);
      // Não falhar se a inicialização der erro, alguns servidores podem não precisar
    }
  }

  /**
   * Para um servidor MCP específico
   */
  async stopServer(serverName: string): Promise<void> {
    const server = this.servers.get(serverName);
    if (!server || !server.process) {
      return;
    }

    this.logger.log(`Parando servidor MCP: ${serverName}`);
    
    // No Windows, usar SIGTERM pode não funcionar bem
    if (process.platform === 'win32') {
      server.process.kill('SIGKILL');
    } else {
      server.process.kill('SIGTERM');
    }
    
    server.isRunning = false;
    server.pendingRequests.clear();
  }

  /**
   * Para todos os servidores MCP
   */
  async stopAllServers(): Promise<void> {
    const stopPromises = Array.from(this.servers.keys()).map(name => 
      this.stopServer(name)
    );
    await Promise.all(stopPromises);
  }

  /**
   * Lista todos os servidores registrados
   */
  getRegisteredServers(): MCPServerConfig[] {
    return Array.from(this.servers.values()).map(server => server.config);
  }

  /**
   * Verifica se um servidor está rodando
   */
  isServerRunning(serverName: string): boolean {
    const server = this.servers.get(serverName);
    return server?.isRunning || false;
  }

  /**
   * Envia uma requisição para um servidor MCP específico
   */
  async sendRequest(serverName: string, method: string, params?: any): Promise<any> {
    const server = this.servers.get(serverName);
    if (!server || !server.process || !server.isRunning) {
      throw new Error(`Servidor ${serverName} não está rodando`);
    }

    const id = server.requestId++;
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      server.pendingRequests.set(id, { resolve, reject });
      
      try {
        server.process!.stdin?.write(JSON.stringify(request) + '\n');
      } catch (error) {
        server.pendingRequests.delete(id);
        reject(new Error(`Erro ao enviar requisição para ${serverName}: ${error}`));
        return;
      }
      
      // Timeout de 30 segundos
      setTimeout(() => {
        if (server.pendingRequests.has(id)) {
          server.pendingRequests.delete(id);
          reject(new Error(`Timeout na requisição para ${serverName}`));
        }
      }, 30000);
    });
  }

  /**
   * Lista ferramentas de um servidor específico
   */
  async listTools(serverName: string): Promise<any> {
    return await this.sendRequest(serverName, 'tools/list');
  }

  /**
   * Chama uma ferramenta de um servidor específico
   */
  async callTool(serverName: string, toolName: string, arguments_: any): Promise<any> {
    return await this.sendRequest(serverName, 'tools/call', {
      name: toolName,
      arguments: arguments_
    });
  }

  private handleServerOutput(serverName: string, data: Buffer): void {
    const server = this.servers.get(serverName);
    if (!server) return;

    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        try {
          const response: MCPResponse = JSON.parse(line);
          this.handleServerResponse(serverName, response);
        } catch (error) {
          // Ignorar linhas que não são JSON válido (logs do servidor)
          this.logger.debug(`Saída não-JSON do servidor ${serverName}: ${line}`);
        }
      }
    }
  }

  private handleServerResponse(serverName: string, response: MCPResponse): void {
    const server = this.servers.get(serverName);
    if (!server) return;

    const pending = server.pendingRequests.get(response.id);
    if (pending) {
      server.pendingRequests.delete(response.id);
      if (response.error) {
        pending.reject(new Error(response.error.message));
      } else {
        pending.resolve(response.result);
      }
    }
  }
} 