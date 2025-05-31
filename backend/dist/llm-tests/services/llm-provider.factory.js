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
var LLMProviderFactory_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderFactory = void 0;
const common_1 = require("@nestjs/common");
const openai_provider_1 = require("../providers/openai.provider");
const anthropic_provider_1 = require("../providers/anthropic.provider");
const gemini_provider_1 = require("../providers/gemini.provider");
let LLMProviderFactory = LLMProviderFactory_1 = class LLMProviderFactory {
    constructor(openaiProvider, anthropicProvider, geminiProvider) {
        this.openaiProvider = openaiProvider;
        this.anthropicProvider = anthropicProvider;
        this.geminiProvider = geminiProvider;
        this.logger = new common_1.Logger(LLMProviderFactory_1.name);
    }
    createProvider(providerName) {
        const normalizedProvider = providerName.toLowerCase().trim();
        this.logger.debug(`Criando provider: ${normalizedProvider}`);
        switch (normalizedProvider) {
            case 'openai':
                return this.openaiProvider;
            case 'anthropic':
                return this.anthropicProvider;
            case 'gemini':
                return this.geminiProvider;
            default:
                const supportedProviders = this.getAvailableProviders().map(p => p.name).join(', ');
                throw new Error(`Provedor LLM não suportado: ${providerName}. Provedores disponíveis: ${supportedProviders}`);
        }
    }
    getAvailableProviders() {
        return [
            {
                name: 'openai',
                models: this.openaiProvider.getSupportedModels(),
                description: 'OpenAI GPT Models - Excelente para geração de código e testes'
            },
            {
                name: 'anthropic',
                models: this.anthropicProvider.getSupportedModels(),
                description: 'Anthropic Claude Models - Ótimo para análise e raciocínio'
            },
            {
                name: 'gemini',
                models: this.geminiProvider.getSupportedModels(),
                description: 'Google Gemini Models - Versátil e eficiente'
            }
        ];
    }
    async validateProviderSupport(providerName) {
        try {
            this.createProvider(providerName);
            return true;
        }
        catch (error) {
            this.logger.warn(`Provider não suportado: ${providerName}`);
            return false;
        }
    }
    getProviderByName(providerName) {
        try {
            return this.createProvider(providerName);
        }
        catch (error) {
            return null;
        }
    }
    getSupportedProviderNames() {
        return this.getAvailableProviders().map(provider => provider.name);
    }
};
exports.LLMProviderFactory = LLMProviderFactory;
exports.LLMProviderFactory = LLMProviderFactory = LLMProviderFactory_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_provider_1.OpenAIProvider,
        anthropic_provider_1.AnthropicProvider,
        gemini_provider_1.GeminiProvider])
], LLMProviderFactory);
//# sourceMappingURL=llm-provider.factory.js.map