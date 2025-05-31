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
        });
        this.logger.log(`Servidor MCP registrado: ${config.name}`);
    }
    async startServer(serverName) {
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
        const isWindows = process.platform === 'win32';
        const command = server.config.command === 'npx' && isWindows
            ? 'npx.cmd'
            : server.config.command;
        server.process = (0, child_process_1.spawn)(command, server.config.args, {
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
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (!server.process || server.process.killed) {
            server.isRunning = false;
            throw new Error(`Falha ao iniciar servidor ${serverName}`);
        }
        try {
            await this.sendRequest(serverName, 'initialize', {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: {
                    name: 'archicrawler-mcp-manager',
                    version: '1.0.0'
                }
            });
        }
        catch (error) {
            this.logger.error(`Erro na inicialização do servidor ${serverName}:`, error);
        }
    }
    async stopServer(serverName) {
        const server = this.servers.get(serverName);
        if (!server || !server.process) {
            return;
        }
        this.logger.log(`Parando servidor MCP: ${serverName}`);
        if (process.platform === 'win32') {
            server.process.kill('SIGKILL');
        }
        else {
            server.process.kill('SIGTERM');
        }
        server.isRunning = false;
        server.pendingRequests.clear();
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
        return server?.isRunning || false;
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
            server.pendingRequests.set(id, { resolve, reject });
            try {
                server.process.stdin?.write(JSON.stringify(request) + '\n');
            }
            catch (error) {
                server.pendingRequests.delete(id);
                reject(new Error(`Erro ao enviar requisição para ${serverName}: ${error}`));
                return;
            }
            setTimeout(() => {
                if (server.pendingRequests.has(id)) {
                    server.pendingRequests.delete(id);
                    reject(new Error(`Timeout na requisição para ${serverName}`));
                }
            }, 30000);
        });
    }
    async listTools(serverName) {
        return await this.sendRequest(serverName, 'tools/list');
    }
    async callTool(serverName, toolName, arguments_) {
        return await this.sendRequest(serverName, 'tools/call', {
            name: toolName,
            arguments: arguments_
        });
    }
    handleServerOutput(serverName, data) {
        const server = this.servers.get(serverName);
        if (!server)
            return;
        const lines = data.toString().trim().split('\n');
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const response = JSON.parse(line);
                    this.handleServerResponse(serverName, response);
                }
                catch (error) {
                    this.logger.debug(`Saída não-JSON do servidor ${serverName}: ${line}`);
                }
            }
        }
    }
    handleServerResponse(serverName, response) {
        const server = this.servers.get(serverName);
        if (!server)
            return;
        const pending = server.pendingRequests.get(response.id);
        if (pending) {
            server.pendingRequests.delete(response.id);
            if (response.error) {
                pending.reject(new Error(response.error.message));
            }
            else {
                pending.resolve(response.result);
            }
        }
    }
};
exports.MCPManagerService = MCPManagerService;
exports.MCPManagerService = MCPManagerService = MCPManagerService_1 = __decorate([
    (0, common_1.Injectable)()
], MCPManagerService);
//# sourceMappingURL=mcp-manager.service.js.map