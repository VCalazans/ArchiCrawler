"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MCPManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPManagerService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
let MCPManagerService = MCPManagerService_1 = class MCPManagerService {
    constructor() {
        this.logger = new common_1.Logger(MCPManagerService_1.name);
        this.servers = new Map();
    }
    async onModuleDestroy() {
        await this.stopAllServers();
    }
    registerServer(config) {
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
    async startServer(serverName) {
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
        const isWindows = process.platform === 'win32';
        const command = server.config.command === 'npx' && isWindows
            ? 'npx.cmd'
            : server.config.command;
        server.outputBuffer = '';
        server.isInitialized = false;
        server.process = (0, child_process_1.spawn)(command, server.config.args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd(),
            env,
            shell: isWindows,
        });
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
            server.pendingRequests.forEach(({ reject, timeout }) => {
                if (timeout)
                    clearTimeout(timeout);
                reject(new Error(`Servidor ${serverName} foi finalizado`));
            });
            server.pendingRequests.clear();
        });
        server.isRunning = true;
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (!server.process || server.process.killed) {
            server.isRunning = false;
            throw new Error(`❌ Falha ao iniciar servidor ${serverName}`);
        }
        try {
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
            await this.sendNotification(serverName, 'notifications/initialized');
            this.logger.log(`🎉 Servidor MCP ${serverName} totalmente inicializado!`);
        }
        catch (error) {
            this.logger.error(`💥 Erro na inicialização MCP do servidor ${serverName}:`, error);
            server.isInitialized = false;
            throw new Error(`Falha na inicialização MCP: ${error.message}`);
        }
    }
    async stopServer(serverName) {
        const server = this.servers.get(serverName);
        if (!server || !server.process) {
            return;
        }
        this.logger.log(`🛑 Parando servidor MCP: ${serverName}`);
        server.pendingRequests.forEach(({ reject, timeout }) => {
            if (timeout)
                clearTimeout(timeout);
            reject(new Error(`Servidor ${serverName} está sendo finalizado`));
        });
        server.pendingRequests.clear();
        if (process.platform === 'win32') {
            server.process.kill('SIGKILL');
        }
        else {
            server.process.kill('SIGTERM');
        }
        server.isRunning = false;
        server.isInitialized = false;
    }
    async stopAllServers() {
        const stopPromises = Array.from(this.servers.keys()).map(name => this.stopServer(name));
        await Promise.all(stopPromises);
    }
    getRegisteredServers() {
        return Array.from(this.servers.values()).map(server => server.config);
    }
    isServerRunning(serverName) {
        const server = this.servers.get(serverName);
        return server?.isRunning && server?.isInitialized || false;
    }
    async sendNotification(serverName, method, params) {
        const server = this.servers.get(serverName);
        if (!server || !server.process || !server.isRunning) {
            throw new Error(`Servidor ${serverName} não está rodando`);
        }
        const notification = {
            jsonrpc: '2.0',
            method,
            params
        };
        const message = JSON.stringify(notification) + '\n';
        this.logger.debug(`📤 Enviando notificação para ${serverName}: ${method}`);
        server.process.stdin?.write(message);
    }
    async sendRequest(serverName, method, params) {
        const server = this.servers.get(serverName);
        if (!server || !server.process || !server.isRunning) {
            throw new Error(`Servidor ${serverName} não está rodando`);
        }
        const id = server.requestId++;
        const request = {
            jsonrpc: '2.0',
            id,
            method,
            params
        };
        return new Promise((resolve, reject) => {
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
                server.process.stdin?.write(message);
            }
            catch (error) {
                clearTimeout(timeout);
                server.pendingRequests.delete(id);
                reject(new Error(`Erro ao enviar requisição para ${serverName}: ${error}`));
            }
        });
    }
    async listTools(serverName) {
        if (!this.isServerRunning(serverName)) {
            throw new Error(`Servidor ${serverName} não está inicializado`);
        }
        return await this.sendRequest(serverName, 'tools/list');
    }
    async callTool(serverName, toolName, arguments_) {
        if (!this.isServerRunning(serverName)) {
            throw new Error(`Servidor ${serverName} não está inicializado`);
        }
        return await this.sendRequest(serverName, 'tools/call', {
            name: toolName,
            arguments: arguments_
        });
    }
    handleServerOutput(serverName, data) {
        const server = this.servers.get(serverName);
        if (!server)
            return;
        server.outputBuffer += data.toString();
        let newlineIndex;
        while ((newlineIndex = server.outputBuffer.indexOf('\n')) !== -1) {
            const line = server.outputBuffer.substring(0, newlineIndex).trim();
            server.outputBuffer = server.outputBuffer.substring(newlineIndex + 1);
            if (line) {
                try {
                    const message = JSON.parse(line);
                    if (message.jsonrpc === '2.0') {
                        if ('id' in message) {
                            this.handleServerResponse(serverName, message);
                        }
                        else if ('method' in message) {
                            this.logger.debug(`📨 Notificação recebida de ${serverName}: ${message.method}`);
                        }
                    }
                }
                catch (error) {
                    this.logger.debug(`📝 ${serverName} log: ${line}`);
                }
            }
        }
    }
    handleServerResponse(serverName, response) {
        const server = this.servers.get(serverName);
        if (!server)
            return;
        this.logger.debug(`📥 Resposta recebida de ${serverName} (id: ${response.id})`);
        const pending = server.pendingRequests.get(response.id);
        if (pending) {
            const { resolve, reject, timeout } = pending;
            if (timeout)
                clearTimeout(timeout);
            server.pendingRequests.delete(response.id);
            if (response.error) {
                reject(new Error(`MCP Error: ${response.error.message}`));
            }
            else {
                resolve(response.result);
            }
        }
        else {
            this.logger.warn(`⚠️ Resposta não solicitada recebida de ${serverName} (id: ${response.id})`);
        }
    }
};
exports.MCPManagerService = MCPManagerService;
exports.MCPManagerService = MCPManagerService = MCPManagerService_1 = __decorate([
    (0, common_1.Injectable)()
], MCPManagerService);
//# sourceMappingURL=mcp-manager.service.js.map