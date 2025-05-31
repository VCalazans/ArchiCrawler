"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const mcp_manager_service_1 = require("./mcp-manager.service");
const mcp_servers_config_1 = require("./mcp-servers.config");
const api_key_guard_1 = require("../auth/guards/api-key.guard");
const mcp_auth_guard_1 = require("../auth/guards/mcp-auth.guard");
class CallToolDto {
}
class StartServerDto {
}
let MCPController = class MCPController {
    constructor(mcpManager) {
        this.mcpManager = mcpManager;
    }
    async onModuleInit() {
        for (const config of mcp_servers_config_1.MCP_SERVERS_CONFIG) {
            this.mcpManager.registerServer(config);
        }
        try {
            await this.mcpManager.startServer('playwright');
        }
        catch (error) {
            console.error('Erro ao iniciar servidor Playwright:', error);
        }
    }
    getServers() {
        const servers = this.mcpManager.getRegisteredServers();
        return {
            success: true,
            servers: servers.map(server => ({
                name: server.name,
                description: server.description,
                isRunning: this.mcpManager.isServerRunning(server.name),
                networkMode: server.networkMode || 'stdio',
                connectionInfo: this.getServerConnectionInfo(server)
            }))
        };
    }
    getConnectionsInfo() {
        const networkServers = (0, mcp_servers_config_1.getNetworkServers)();
        const connections = networkServers.map(server => ({
            name: server.name,
            description: server.description,
            isRunning: this.mcpManager.isServerRunning(server.name),
            connectionType: server.networkMode,
            host: server.host || 'localhost',
            port: server.port,
            url: server.networkMode === 'tcp'
                ? `tcp://${server.host || 'localhost'}:${server.port}`
                : server.networkMode === 'http'
                    ? `http://${server.host || 'localhost'}:${server.port}`
                    : null,
            clientConfig: this.generateClientConfig(server)
        }));
        return {
            success: true,
            message: 'Informações de conexão para clientes MCP externos',
            connections,
            instructions: {
                claude: 'Para conectar no Claude Desktop, adicione a configuração no arquivo claude_desktop_config.json',
                cursor: 'Para conectar no Cursor, adicione a configuração nas configurações MCP',
                generic: 'Para outros clientes MCP, use as URLs de conexão fornecidas'
            }
        };
    }
    async startServer(serverName) {
        try {
            await this.mcpManager.startServer(serverName);
            const server = this.mcpManager.getRegisteredServers().find(s => s.name === serverName);
            const connectionInfo = server ? this.getServerConnectionInfo(server) : null;
            return {
                success: true,
                message: `Servidor ${serverName} iniciado com sucesso`,
                connectionInfo
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    async stopServer(serverName) {
        try {
            await this.mcpManager.stopServer(serverName);
            return {
                success: true,
                message: `Servidor ${serverName} parado com sucesso`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    getServerStatus(serverName) {
        const isRunning = this.mcpManager.isServerRunning(serverName);
        const server = this.mcpManager.getRegisteredServers().find(s => s.name === serverName);
        return {
            success: true,
            serverName,
            isRunning,
            connectionInfo: server ? this.getServerConnectionInfo(server) : null
        };
    }
    async listTools(serverName) {
        try {
            const result = await this.mcpManager.listTools(serverName);
            return {
                success: true,
                serverName,
                tools: result.tools || []
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    async callTool(callToolDto) {
        try {
            const result = await this.mcpManager.callTool(callToolDto.serverName, callToolDto.toolName, callToolDto.arguments);
            return {
                success: true,
                serverName: callToolDto.serverName,
                toolName: callToolDto.toolName,
                result
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    async playwrightNavigate(body) {
        return this.callTool({
            serverName: 'playwright',
            toolName: 'browser_navigate',
            arguments: { url: body.url }
        });
    }
    async playwrightClick(body) {
        return this.callTool({
            serverName: 'playwright',
            toolName: 'browser_click',
            arguments: { element: body.element }
        });
    }
    async playwrightFill(body) {
        return this.callTool({
            serverName: 'playwright',
            toolName: 'browser_fill',
            arguments: { element: body.element, text: body.text }
        });
    }
    async playwrightSnapshot() {
        return this.callTool({
            serverName: 'playwright',
            toolName: 'browser_snapshot',
            arguments: {}
        });
    }
    async playwrightScreenshot(body) {
        return this.callTool({
            serverName: 'playwright',
            toolName: 'browser_take_screenshot',
            arguments: body
        });
    }
    async playwrightListTabs() {
        return this.callTool({
            serverName: 'playwright',
            toolName: 'browser_tab_list',
            arguments: {}
        });
    }
    async playwrightClose() {
        return this.callTool({
            serverName: 'playwright',
            toolName: 'browser_close',
            arguments: {}
        });
    }
    getServerConnectionInfo(server) {
        if (!server.networkMode || server.networkMode === 'stdio') {
            return {
                type: 'internal',
                message: 'Servidor interno - acesse via API REST',
                apiUrl: `http://localhost:3001/mcp/servers/${server.name}`
            };
        }
        if (server.networkMode === 'tcp') {
            return {
                type: 'tcp',
                host: server.host || 'localhost',
                port: server.port,
                url: `tcp://${server.host || 'localhost'}:${server.port}`,
                message: 'Conecte clientes MCP via TCP'
            };
        }
        if (server.networkMode === 'http') {
            return {
                type: 'http',
                host: server.host || 'localhost',
                port: server.port,
                url: `http://${server.host || 'localhost'}:${server.port}`,
                message: 'Conecte clientes MCP via HTTP'
            };
        }
        return null;
    }
    generateClientConfig(server) {
        if (server.networkMode === 'tcp') {
            return {
                claude_desktop: {
                    mcpServers: {
                        [server.name]: {
                            command: "nc",
                            args: [server.host || 'localhost', String(server.port)]
                        }
                    }
                },
                cursor: {
                    mcp: {
                        servers: {
                            [server.name]: {
                                transport: "tcp",
                                host: server.host || 'localhost',
                                port: server.port
                            }
                        }
                    }
                }
            };
        }
        return {
            note: 'Configuração específica depende do tipo de transporte'
        };
    }
};
exports.MCPController = MCPController;
__decorate([
    (0, common_1.Get)('servers'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os servidores MCP disponíveis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de servidores MCP' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MCPController.prototype, "getServers", null);
__decorate([
    (0, common_1.Get)('connections'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter informações de conexão para clientes MCP externos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Informações de conexão MCP' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MCPController.prototype, "getConnectionsInfo", null);
__decorate([
    (0, common_1.Post)('servers/:serverName/start'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key para autenticação' }),
    (0, swagger_1.ApiOperation)({ summary: 'Iniciar um servidor MCP específico' }),
    (0, swagger_1.ApiParam)({ name: 'serverName', description: 'Nome do servidor MCP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Servidor iniciado com sucesso' }),
    __param(0, (0, common_1.Param)('serverName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MCPController.prototype, "startServer", null);
__decorate([
    (0, common_1.Post)('servers/:serverName/stop'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key para autenticação' }),
    (0, swagger_1.ApiOperation)({ summary: 'Parar um servidor MCP específico' }),
    (0, swagger_1.ApiParam)({ name: 'serverName', description: 'Nome do servidor MCP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Servidor parado com sucesso' }),
    __param(0, (0, common_1.Param)('serverName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MCPController.prototype, "stopServer", null);
__decorate([
    (0, common_1.Get)('servers/:serverName/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar status de um servidor MCP' }),
    (0, swagger_1.ApiParam)({ name: 'serverName', description: 'Nome do servidor MCP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status do servidor' }),
    __param(0, (0, common_1.Param)('serverName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MCPController.prototype, "getServerStatus", null);
__decorate([
    (0, common_1.Get)('servers/:serverName/tools'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key para autenticação' }),
    (0, swagger_1.ApiOperation)({ summary: 'Listar ferramentas de um servidor MCP' }),
    (0, swagger_1.ApiParam)({ name: 'serverName', description: 'Nome do servidor MCP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de ferramentas' }),
    __param(0, (0, common_1.Param)('serverName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MCPController.prototype, "listTools", null);
__decorate([
    (0, common_1.Post)('call-tool'),
    (0, common_1.UseGuards)(mcp_auth_guard_1.MCPAuthGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' }),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' }),
    (0, swagger_1.ApiOperation)({ summary: 'Chamar uma ferramenta de um servidor MCP' }),
    (0, swagger_1.ApiBody)({ type: CallToolDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ferramenta executada com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CallToolDto]),
    __metadata("design:returntype", Promise)
], MCPController.prototype, "callTool", null);
__decorate([
    (0, common_1.Post)('playwright/navigate'),
    (0, common_1.UseGuards)(mcp_auth_guard_1.MCPAuthGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' }),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' }),
    (0, swagger_1.ApiOperation)({ summary: 'Navegar para uma URL usando Playwright' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Navegação realizada com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MCPController.prototype, "playwrightNavigate", null);
__decorate([
    (0, common_1.Post)('playwright/click'),
    (0, common_1.UseGuards)(mcp_auth_guard_1.MCPAuthGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' }),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' }),
    (0, swagger_1.ApiOperation)({ summary: 'Clicar em um elemento usando Playwright' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Clique realizado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MCPController.prototype, "playwrightClick", null);
__decorate([
    (0, common_1.Post)('playwright/fill'),
    (0, common_1.UseGuards)(mcp_auth_guard_1.MCPAuthGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' }),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' }),
    (0, swagger_1.ApiOperation)({ summary: 'Preencher um campo usando Playwright' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Campo preenchido com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MCPController.prototype, "playwrightFill", null);
__decorate([
    (0, common_1.Get)('playwright/snapshot'),
    (0, common_1.UseGuards)(mcp_auth_guard_1.MCPAuthGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' }),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' }),
    (0, swagger_1.ApiOperation)({ summary: 'Obter snapshot da página usando Playwright' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Snapshot obtido com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MCPController.prototype, "playwrightSnapshot", null);
__decorate([
    (0, common_1.Post)('playwright/screenshot'),
    (0, common_1.UseGuards)(mcp_auth_guard_1.MCPAuthGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' }),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' }),
    (0, swagger_1.ApiOperation)({ summary: 'Tirar screenshot usando Playwright' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Screenshot realizado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MCPController.prototype, "playwrightScreenshot", null);
__decorate([
    (0, common_1.Get)('playwright/tabs'),
    (0, common_1.UseGuards)(mcp_auth_guard_1.MCPAuthGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' }),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' }),
    (0, swagger_1.ApiOperation)({ summary: 'Listar abas usando Playwright' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Abas listadas com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MCPController.prototype, "playwrightListTabs", null);
__decorate([
    (0, common_1.Post)('playwright/close'),
    (0, common_1.UseGuards)(mcp_auth_guard_1.MCPAuthGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' }),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' }),
    (0, swagger_1.ApiOperation)({ summary: 'Fechar navegador usando Playwright' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Navegador fechado com sucesso' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MCPController.prototype, "playwrightClose", null);
exports.MCPController = MCPController = __decorate([
    (0, swagger_1.ApiTags)('mcp'),
    (0, common_1.Controller)('mcp'),
    __metadata("design:paramtypes", [mcp_manager_service_1.MCPManagerService])
], MCPController);
//# sourceMappingURL=mcp.controller.js.map