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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_custom_1 = require("passport-custom");
const auth_service_1 = require("../auth.service");
let ApiKeyStrategy = class ApiKeyStrategy extends (0, passport_1.PassportStrategy)(passport_custom_1.Strategy, 'api-key') {
    constructor(authService) {
        super();
        this.authService = authService;
    }
    async validate(req) {
        const apiKey = this.extractApiKey(req);
        if (!apiKey) {
            throw new common_1.UnauthorizedException('API Key não fornecida');
        }
        const clientIP = this.getClientIP(req);
        const result = await this.authService.validateApiKey(apiKey, clientIP);
        if (!result) {
            throw new common_1.UnauthorizedException('API Key inválida');
        }
        req['apiKey'] = result.apiKey;
        return result.user;
    }
    extractApiKey(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ak_')) {
            return authHeader.substring(7);
        }
        const apiKeyHeader = req.headers['x-api-key'];
        if (apiKeyHeader && apiKeyHeader.startsWith('ak_')) {
            return apiKeyHeader;
        }
        const queryApiKey = req.query.api_key;
        if (queryApiKey && queryApiKey.startsWith('ak_')) {
            return queryApiKey;
        }
        return null;
    }
    getClientIP(req) {
        return (req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection?.socket?.remoteAddress ||
            '127.0.0.1');
    }
};
exports.ApiKeyStrategy = ApiKeyStrategy;
exports.ApiKeyStrategy = ApiKeyStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], ApiKeyStrategy);
//# sourceMappingURL=api-key.strategy.js.map