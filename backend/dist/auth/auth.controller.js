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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const api_key_guard_1 = require("./guards/api-key.guard");
const mcp_auth_guard_1 = require("./guards/mcp-auth.guard");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto, clientIP) {
        return await this.authService.login(loginDto.username, loginDto.password, clientIP);
    }
    async register(createUserDto) {
        const user = await this.authService.createUser(createUserDto.username, createUserDto.email, createUserDto.password, createUserDto.role);
        return {
            success: true,
            message: 'Usuário criado com sucesso',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        };
    }
    async getProfile(req) {
        return {
            success: true,
            user: req.user,
        };
    }
    async createApiKey(req, createApiKeyDto) {
        const result = await this.authService.generateApiKey(req.user.id, createApiKeyDto.name, createApiKeyDto.permissions || [], createApiKeyDto.expiresInDays);
        return {
            success: true,
            message: 'API Key criada com sucesso',
            apiKey: {
                id: result.apiKey.id,
                name: result.apiKey.name,
                key: result.key,
                permissions: result.apiKey.permissions,
                expiresAt: result.apiKey.expiresAt,
            },
            warning: 'Guarde esta chave com segurança. Ela não será mostrada novamente.',
        };
    }
    async listApiKeys(req) {
        const apiKeys = await this.authService.getUserApiKeys(req.user.id);
        return {
            success: true,
            apiKeys,
        };
    }
    async revokeApiKey(req, apiKeyId) {
        const success = await this.authService.revokeApiKey(apiKeyId, req.user.id);
        if (!success) {
            return {
                success: false,
                message: 'API Key não encontrada',
            };
        }
        return {
            success: true,
            message: 'API Key revogada com sucesso',
        };
    }
    async createMCPClient(createMCPClientDto) {
        const mcpClient = await this.authService.createMCPClient(createMCPClientDto.name, createMCPClientDto.permissions || [], createMCPClientDto.allowedIPs || []);
        return {
            success: true,
            message: 'Cliente MCP criado com sucesso',
            client: {
                id: mcpClient.id,
                name: mcpClient.name,
                clientId: mcpClient.clientId,
                clientSecret: mcpClient.clientSecret,
                permissions: mcpClient.permissions,
                allowedIPs: mcpClient.allowedIPs,
            },
            warning: 'Guarde estas credenciais com segurança. Elas não serão mostradas novamente.',
        };
    }
    async listMCPClients() {
        const clients = await this.authService.getMCPClients();
        return {
            success: true,
            clients,
        };
    }
    async revokeMCPClient(clientId) {
        const success = await this.authService.revokeMCPClient(clientId);
        if (!success) {
            return {
                success: false,
                message: 'Cliente MCP não encontrado',
            };
        }
        return {
            success: true,
            message: 'Cliente MCP revogado com sucesso',
        };
    }
    async testApiKey(req) {
        return {
            success: true,
            message: 'API Key válida',
            user: req.user,
            apiKey: {
                id: req.apiKey.id,
                name: req.apiKey.name,
                permissions: req.apiKey.permissions,
                lastUsed: req.apiKey.lastUsed,
            },
        };
    }
    async testMCP(req) {
        return {
            success: true,
            message: 'Cliente MCP válido',
            client: {
                id: req.mcpClient.id,
                name: req.mcpClient.name,
                clientId: req.mcpClient.clientId,
                permissions: req.mcpClient.permissions,
                allowedIPs: req.mcpClient.allowedIPs,
            },
        };
    }
    async getStats() {
        const stats = await this.authService.getAuthStats();
        return {
            success: true,
            stats,
        };
    }
    async checkPermission(req, permission) {
        if (!permission) {
            return {
                success: false,
                message: 'Parâmetro permission é obrigatório',
            };
        }
        const hasPermission = this.authService.hasPermission(req.apiKey.permissions, permission);
        return {
            success: true,
            permission,
            hasPermission,
            userPermissions: req.apiKey.permissions,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login com usuário e senha' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login realizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Credenciais inválidas' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo usuário' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.CreateUserDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Usuário criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obter perfil do usuário autenticado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil do usuário' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('api-keys'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar nova API Key' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.CreateApiKeyDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'API Key criada com sucesso' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.CreateApiKeyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createApiKey", null);
__decorate([
    (0, common_1.Get)('api-keys'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar API Keys do usuário' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de API Keys' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "listApiKeys", null);
__decorate([
    (0, common_1.Delete)('api-keys/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Revogar API Key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API Key revogada com sucesso' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeApiKey", null);
__decorate([
    (0, common_1.Post)('mcp-clients'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar cliente MCP' }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.CreateMCPClientDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cliente MCP criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.CreateMCPClientDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createMCPClient", null);
__decorate([
    (0, common_1.Get)('mcp-clients'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar clientes MCP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de clientes MCP' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "listMCPClients", null);
__decorate([
    (0, common_1.Delete)('mcp-clients/:clientId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Revogar cliente MCP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cliente MCP revogado com sucesso' }),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeMCPClient", null);
__decorate([
    (0, common_1.Get)('test-api-key'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key para autenticação' }),
    (0, swagger_1.ApiOperation)({ summary: 'Testar autenticação via API Key' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'API Key válida' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "testApiKey", null);
__decorate([
    (0, common_1.Get)('test-mcp'),
    (0, common_1.UseGuards)(mcp_auth_guard_1.MCPAuthGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-ID', description: 'ID do cliente MCP' }),
    (0, swagger_1.ApiHeader)({ name: 'X-MCP-Client-Secret', description: 'Secret do cliente MCP' }),
    (0, swagger_1.ApiOperation)({ summary: 'Testar autenticação MCP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cliente MCP válido' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "testMCP", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obter estatísticas de autenticação' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estatísticas de autenticação' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('check-permission'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API Key para autenticação' }),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar permissão específica' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resultado da verificação de permissão' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkPermission", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map