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
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

interface MCPServerInstance {
  config: MCPServerConfig;
  process: ChildProcess | null;
  requestId: number;
  pendingRequests: Map<string | number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timeout?: NodeJS.Timeout;
  }>;
  isRunning: boolean;
  isInitialized: boolean;
  capabilities?: any;
  outputBuffer: string;
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
      isInitialized: false,
      capabilities: null,
      outputBuffer: '',
    });
    this.logger.log(`🔌 Servidor MCP registrado: ${config.name}`);
  }

  /**
   * Inicia um servidor MCP específico seguindo o protocolo oficial 2025
   */
  async startServer(serverName: string): Promise<void> {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`Servidor MCP não encontrado: ${serverName}`);
    }

    if (server.isRunning) {
      this.logger.warn(`⚠️ Servidor ${serverName} já está rodando`);
      return;
    }

    this.logger.log(`🚀 Iniciando servidor MCP: ${serverName}`);
    this.logger.log(`📝 Comando: ${server.config.command} ${server.config.args.join(' ')}`);

    const env = { ...process.env, ...server.config.env };
    
    // Ajustar comando para Windows
    const isWindows = process.platform === 'win32';
    const command = server.config.command === 'npx' && isWindows 
      ? 'npx.cmd' 
      : server.config.command;

    // Reset do buffer e estado
    server.outputBuffer = '';
    server.isInitialized = false;

    server.process = spawn(command, server.config.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
      env,
      shell: isWindows,
    });

    // Configurar handlers de dados
    server.process.stdout?.on('data', (data) => {
      this.handleServerOutput(serverName, data);
    });

    server.process.stderr?.on('data', (data) => {
      const errorText = data.toString();
      this.logger.error(`❌ ${serverName} stderr: ${errorText}`);
    });

    server.process.on('error', (error) => {
      this.logger.error(`💥 Erro no servidor ${serverName}:`, error);
      server.isRunning = false;
      server.isInitialized = false;
      
      if (error.message.includes('ENOENT')) {
        this.logger.error(`🚫 Comando não encontrado: ${command}. Verifique se @playwright/mcp está instalado.`);
      }
    });

    server.process.on('exit', (code, signal) => {
      this.logger.log(`🔚 Servidor ${serverName} finalizado - código: ${code}, sinal: ${signal}`);
      server.isRunning = false;
      server.isInitialized = false;
      server.process = null;
      
      // Rejeitar todas as requisições pendentes
      server.pendingRequests.forEach(({ reject, timeout }) => {
        if (timeout) clearTimeout(timeout);
        reject(new Error(`Servidor ${serverName} foi finalizado`));
      });
      server.pendingRequests.clear();
    });

    server.isRunning = true;

    // Aguardar processo inicializar
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!server.process || server.process.killed) {
      server.isRunning = false;
      throw new Error(`❌ Falha ao iniciar servidor ${serverName}`);
    }

    try {
      // PASSO 1: Inicializar protocolo MCP conforme especificação 2025
      this.logger.log(`🤝 Iniciando handshake MCP com ${serverName}...`);
      
      const initResponse = await this.sendRequest(serverName, 'initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {
          sampling: {}
        },
        clientInfo: {
          name: 'archicrawler-mcp-client',
          version: '1.0.0'
        }
      });

      this.logger.log(`✅ Handshake MCP completo para ${serverName}:`, initResponse);
      server.capabilities = initResponse.capabilities;
      server.isInitialized = true;

      // PASSO 2: Notificar inicialização completa
      await this.sendNotification(serverName, 'notifications/initialized');

      this.logger.log(`🎉 Servidor MCP ${serverName} totalmente inicializado!`);

    } catch (error) {
      this.logger.error(`💥 Erro na inicialização MCP do servidor ${serverName}:`, error);
      server.isInitialized = false;
      throw new Error(`Falha na inicialização MCP: ${error.message}`);
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

    this.logger.log(`🛑 Parando servidor MCP: ${serverName}`);
    
    // Cancelar todas as requisições pendentes
    server.pendingRequests.forEach(({ reject, timeout }) => {
      if (timeout) clearTimeout(timeout);
      reject(new Error(`Servidor ${serverName} está sendo finalizado`));
    });
    server.pendingRequests.clear();
    
    // No Windows, usar SIGTERM pode não funcionar bem
    if (process.platform === 'win32') {
      server.process.kill('SIGKILL');
    } else {
      server.process.kill('SIGTERM');
    }
    
    server.isRunning = false;
    server.isInitialized = false;
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
   * Verifica se um servidor está rodando e inicializado
   */
  isServerRunning(serverName: string): boolean {
    const server = this.servers.get(serverName);
    return server?.isRunning && server?.isInitialized || false;
  }

  /**
   * Envia uma notificação para um servidor MCP (sem resposta esperada)
   */
  async sendNotification(serverName: string, method: string, params?: any): Promise<void> {
    const server = this.servers.get(serverName);
    if (!server || !server.process || !server.isRunning) {
      throw new Error(`Servidor ${serverName} não está rodando`);
    }

    const notification: MCPNotification = {
      jsonrpc: '2.0',
      method,
      params
    };

    const message = JSON.stringify(notification) + '\n';
    this.logger.debug(`📤 Enviando notificação para ${serverName}: ${method}`);
    
    server.process.stdin?.write(message);
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
      // Timeout de 60 segundos para requisições importantes
      const timeout = setTimeout(() => {
        if (server.pendingRequests.has(id)) {
          server.pendingRequests.delete(id);
          reject(new Error(`⏰ Timeout na requisição ${method} para ${serverName} (60s)`));
        }
      }, 60000);

      server.pendingRequests.set(id, { resolve, reject, timeout });
      
      try {
        const message = JSON.stringify(request) + '\n';
        this.logger.debug(`📤 Enviando requisição para ${serverName}: ${method} (id: ${id})`);
        server.process!.stdin?.write(message);
      } catch (error) {
        clearTimeout(timeout);
        server.pendingRequests.delete(id);
        reject(new Error(`Erro ao enviar requisição para ${serverName}: ${error}`));
      }
    });
  }

  /**
   * Lista ferramentas disponíveis no servidor MCP
   */
  async listTools(serverName: string): Promise<any> {
    if (!this.isServerRunning(serverName)) {
      throw new Error(`Servidor ${serverName} não está inicializado`);
    }
    return await this.sendRequest(serverName, 'tools/list');
  }

  /**
   * Chama uma ferramenta específica no servidor MCP
   */
  async callTool(serverName: string, toolName: string, arguments_: any): Promise<any> {
    if (!this.isServerRunning(serverName)) {
      throw new Error(`Servidor ${serverName} não está inicializado`);
    }
    
    return await this.sendRequest(serverName, 'tools/call', {
      name: toolName,
      arguments: arguments_
    });
  }

  /**
   * Processa saída do servidor MCP com parsing correto de JSON-RPC
   */
  private handleServerOutput(serverName: string, data: Buffer): void {
    const server = this.servers.get(serverName);
    if (!server) return;

    // Adicionar dados ao buffer
    server.outputBuffer += data.toString();

    // Processar mensagens linha por linha
    let newlineIndex;
    while ((newlineIndex = server.outputBuffer.indexOf('\n')) !== -1) {
      const line = server.outputBuffer.substring(0, newlineIndex).trim();
      server.outputBuffer = server.outputBuffer.substring(newlineIndex + 1);

      if (line) {
        try {
          const message = JSON.parse(line);
          
          if (message.jsonrpc === '2.0') {
            if ('id' in message) {
              // É uma resposta
              this.handleServerResponse(serverName, message);
            } else if ('method' in message) {
              // É uma notificação do servidor
              this.logger.debug(`📨 Notificação recebida de ${serverName}: ${message.method}`);
            }
          }
        } catch (error) {
          // Linha não é JSON válido, pode ser log do servidor
          this.logger.debug(`📝 ${serverName} log: ${line}`);
        }
      }
    }
  }

  /**
   * Processa respostas JSON-RPC do servidor MCP
   */
  private handleServerResponse(serverName: string, response: MCPResponse): void {
    const server = this.servers.get(serverName);
    if (!server) return;

    this.logger.debug(`📥 Resposta recebida de ${serverName} (id: ${response.id})`);

    const pending = server.pendingRequests.get(response.id);
    if (pending) {
      const { resolve, reject, timeout } = pending;
      
      if (timeout) clearTimeout(timeout);
      server.pendingRequests.delete(response.id);
      
      if (response.error) {
        reject(new Error(`MCP Error: ${response.error.message}`));
      } else {
        resolve(response.result);
      }
    } else {
      this.logger.warn(`⚠️ Resposta não solicitada recebida de ${serverName} (id: ${response.id})`);
    }
  }
} 