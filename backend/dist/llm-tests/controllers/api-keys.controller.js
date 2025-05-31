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
exports.ApiKeysController = void 0;
const common_1 = require("@nestjs/common");
const api_key_manager_service_1 = require("../services/api-key-manager.service");
const llm_provider_factory_1 = require("../services/llm-provider.factory");
const api_key_dto_1 = require("../dto/api-key.dto");
let ApiKeysController = class ApiKeysController {
    constructor(apiKeyManager, providerFactory) {
        this.apiKeyManager = apiKeyManager;
        this.providerFactory = providerFactory;
    }
    async storeApiKey(dto, req) {
        const userId = req.user?.id || 'demo-user';
        try {
            const isSupported = await this.providerFactory.validateProviderSupport(dto.provider);
            if (!isSupported) {
                throw new Error(`Provedor não suportado: ${dto.provider}`);
            }
            const provider = this.providerFactory.createProvider(dto.provider);
            const isValid = await provider.validateApiKey(dto.apiKey);
            if (!isValid) {
                return {
                    success: false,
                    message: 'Chave API inválida',
                    provider: dto.provider
                };
            }
            await this.apiKeyManager.storeApiKey(userId, dto.provider, dto.apiKey);
            return {
                success: true,
                message: 'Chave API armazenada com sucesso',
                provider: dto.provider
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                provider: dto.provider
            };
        }
    }
    async listProviders(req) {
        const userId = req.user?.id || 'demo-user';
        try {
            const userProviders = await this.apiKeyManager.listUserProviders(userId);
            const availableProviders = this.providerFactory.getAvailableProviders();
            return {
                success: true,
                data: {
                    configured: userProviders,
                    available: availableProviders.map(p => ({
                        name: p.name,
                        description: p.description,
                        models: p.models
                    }))
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
    async validateApiKey(provider, req) {
        const userId = req.user?.id || 'demo-user';
        try {
            const isValid = await this.apiKeyManager.validateApiKey(userId, provider);
            return {
                success: true,
                data: {
                    provider,
                    isValid,
                    message: isValid ? 'Chave API válida' : 'Chave API inválida ou não encontrada'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                provider
            };
        }
    }
    async deleteApiKey(provider, req) {
        const userId = req.user?.id || 'demo-user';
        try {
            await this.apiKeyManager.deleteApiKey(userId, provider);
            return {
                success: true,
                message: 'Chave API removida com sucesso',
                provider
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                provider
            };
        }
    }
    async getApiKeysStatus(req) {
        const userId = req.user?.id || 'demo-user';
        try {
            const userProviders = await this.apiKeyManager.listUserProviders(userId);
            const statusPromises = userProviders.map(async (provider) => {
                const isValid = await this.apiKeyManager.validateApiKey(userId, provider);
                return {
                    provider,
                    isValid,
                    lastChecked: new Date().toISOString()
                };
            });
            const statuses = await Promise.all(statusPromises);
            return {
                success: true,
                data: statuses
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
};
exports.ApiKeysController = ApiKeysController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [api_key_dto_1.StoreApiKeyDto, Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "storeApiKey", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "listProviders", null);
__decorate([
    (0, common_1.Post)(':provider/validate'),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "validateApiKey", null);
__decorate([
    (0, common_1.Delete)(':provider'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "deleteApiKey", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "getApiKeysStatus", null);
exports.ApiKeysController = ApiKeysController = __decorate([
    (0, common_1.Controller)('llm-tests/api-keys'),
    __metadata("design:paramtypes", [api_key_manager_service_1.ApiKeyManagerService,
        llm_provider_factory_1.LLMProviderFactory])
], ApiKeysController);
//# sourceMappingURL=api-keys.controller.js.map