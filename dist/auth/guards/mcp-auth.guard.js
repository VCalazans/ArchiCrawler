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
var MCPAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth.service");
let MCPAuthGuard = MCPAuthGuard_1 = class MCPAuthGuard {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(MCPAuthGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const clientId = this.extractClientId(request);
        const clientSecret = this.extractClientSecret(request);
        if (!clientId || !clientSecret) {
            this.logger.warn('🚫 Credenciais MCP não fornecidas');
            throw new common_1.UnauthorizedException('Credenciais MCP obrigatórias');
        }
        const clientIP = this.getClientIP(request);
        const mcpClient = await this.authService.validateMCPClient(clientId, clientSecret, clientIP);
        if (!mcpClient) {
            this.logger.warn(`🚫 Cliente MCP inválido: ${clientId} de ${clientIP}`);
            throw new common_1.UnauthorizedException('Cliente MCP inválido');
        }
        request['mcpClient'] = mcpClient;
        this.logger.log(`✅ Cliente MCP autenticado: ${mcpClient.name} de ${clientIP}`);
        return true;
    }
    extractClientId(request) {
        const headerClientId = request.headers['x-mcp-client-id'];
        if (headerClientId) {
            return headerClientId;
        }
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Basic ')) {
            try {
                const credentials = Buffer.from(authHeader.substring(6), 'base64').toString();
                const [clientId] = credentials.split(':');
                return clientId;
            }
            catch (error) {
                return null;
            }
        }
        const queryClientId = request.query.client_id;
        if (queryClientId) {
            return queryClientId;
        }
        return null;
    }
    extractClientSecret(request) {
        const headerClientSecret = request.headers['x-mcp-client-secret'];
        if (headerClientSecret) {
            return headerClientSecret;
        }
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Basic ')) {
            try {
                const credentials = Buffer.from(authHeader.substring(6), 'base64').toString();
                const [, clientSecret] = credentials.split(':');
                return clientSecret;
            }
            catch (error) {
                return null;
            }
        }
        const queryClientSecret = request.query.client_secret;
        if (queryClientSecret) {
            return queryClientSecret;
        }
        return null;
    }
    getClientIP(request) {
        return (request.headers['x-forwarded-for'] ||
            request.headers['x-real-ip'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection?.socket?.remoteAddress ||
            '127.0.0.1');
    }
};
exports.MCPAuthGuard = MCPAuthGuard;
exports.MCPAuthGuard = MCPAuthGuard = MCPAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], MCPAuthGuard);
//# sourceMappingURL=mcp-auth.guard.js.map