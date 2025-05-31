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
var ApiKeyManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyManagerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const user_api_key_entity_1 = require("../entities/user-api-key.entity");
let ApiKeyManagerService = ApiKeyManagerService_1 = class ApiKeyManagerService {
    constructor(userApiKeyRepository, configService) {
        this.userApiKeyRepository = userApiKeyRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(ApiKeyManagerService_1.name);
        this.encryptionKey = this.configService.get('API_KEY_ENCRYPTION_SECRET') || 'default-key-change-me';
    }
    encrypt(text) {
        const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
    decrypt(encryptedText) {
        const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    async storeApiKey(userId, provider, apiKey) {
        const encryptedKey = this.encrypt(apiKey);
        const existingKey = await this.userApiKeyRepository.findOne({
            where: { userId, provider }
        });
        if (existingKey) {
            existingKey.encryptedApiKey = encryptedKey;
            await this.userApiKeyRepository.save(existingKey);
        }
        else {
            const newApiKey = this.userApiKeyRepository.create({
                userId,
                provider,
                encryptedApiKey: encryptedKey,
                isActive: true
            });
            await this.userApiKeyRepository.save(newApiKey);
        }
    }
    async getDecryptedApiKey(userId, provider) {
        const apiKeyRecord = await this.userApiKeyRepository.findOne({
            where: { userId, provider, isActive: true }
        });
        if (!apiKeyRecord) {
            return null;
        }
        return this.decrypt(apiKeyRecord.encryptedApiKey);
    }
    async deleteApiKey(userId, provider) {
        await this.userApiKeyRepository.delete({ userId, provider });
    }
    async listUserProviders(userId) {
        const apiKeys = await this.userApiKeyRepository.find({
            where: { userId, isActive: true }
        });
        return apiKeys.map(key => key.provider);
    }
    async validateApiKey(userId, provider) {
        try {
            const apiKey = await this.getDecryptedApiKey(userId, provider);
            if (!apiKey) {
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Erro ao validar chave API: ${error.message}`);
            return false;
        }
    }
};
exports.ApiKeyManagerService = ApiKeyManagerService;
exports.ApiKeyManagerService = ApiKeyManagerService = ApiKeyManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_api_key_entity_1.UserApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], ApiKeyManagerService);
//# sourceMappingURL=api-key-manager.service.js.map