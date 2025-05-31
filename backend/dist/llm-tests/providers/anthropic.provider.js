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
var AnthropicProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = require("@anthropic-ai/sdk");
const base_llm_provider_1 = require("./base-llm.provider");
let AnthropicProvider = AnthropicProvider_1 = class AnthropicProvider extends base_llm_provider_1.BaseLLMProvider {
    constructor() {
        super();
        this.name = 'anthropic';
        this.apiVersion = 'v1';
        this.logger = new common_1.Logger(AnthropicProvider_1.name);
    }
    createClient(apiKey) {
        return new sdk_1.default({
            apiKey,
            timeout: 30000,
            maxRetries: 2
        });
    }
    async generateTest(prompt, apiKey) {
        const client = this.createClient(apiKey);
        const formattedPrompt = this.formatPromptForMCP(prompt);
        try {
            this.logger.debug(`Gerando teste com Anthropic, tokens estimados: ${this.estimateTokens(formattedPrompt)}`);
            const completion = await client.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2000,
                temperature: 0.1,
                system: prompt.system,
                messages: [
                    { role: 'user', content: formattedPrompt }
                ]
            });
            const textBlock = completion.content.find(block => block.type === 'text');
            const response = textBlock ? textBlock.text : '';
            if (!response) {
                throw new Error('Resposta vazia do Anthropic');
            }
            this.logger.debug(`Resposta recebida do Anthropic: ${response.substring(0, 200)}...`);
            const result = this.parseResponse(response);
            result.metadata.tokensUsed = completion.usage?.output_tokens || this.estimateTokens(response);
            result.metadata.model = 'claude-3-sonnet';
            return result;
        }
        catch (error) {
            this.logger.error(`Erro ao gerar teste com Anthropic: ${error.message}`);
            throw this.handleApiError(error, 'Anthropic');
        }
    }
    async validateApiKey(apiKey) {
        try {
            const client = this.createClient(apiKey);
            await client.messages.create({
                model: 'claude-3-haiku-20240307',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hi' }]
            });
            this.logger.debug('API Key Anthropic validada com sucesso');
            return true;
        }
        catch (error) {
            this.logger.warn(`Falha na validação da API Key Anthropic: ${error.message}`);
            return false;
        }
    }
    getSupportedModels() {
        return [
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307',
            'claude-2.1',
            'claude-2.0'
        ];
    }
    async generateTestWithModel(prompt, apiKey, model = 'claude-3-sonnet-20240229') {
        const client = this.createClient(apiKey);
        const formattedPrompt = this.formatPromptForMCP(prompt);
        try {
            const completion = await client.messages.create({
                model,
                max_tokens: model.includes('opus') ? 3000 : 2000,
                temperature: 0.1,
                system: prompt.system,
                messages: [
                    { role: 'user', content: formattedPrompt }
                ]
            });
            const textBlock = completion.content.find(block => block.type === 'text');
            const response = textBlock ? textBlock.text : '';
            if (!response) {
                throw new Error('Resposta vazia do Anthropic');
            }
            const result = this.parseResponse(response);
            result.metadata.tokensUsed = completion.usage?.output_tokens || this.estimateTokens(response);
            result.metadata.model = model;
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'Anthropic');
        }
    }
};
exports.AnthropicProvider = AnthropicProvider;
exports.AnthropicProvider = AnthropicProvider = AnthropicProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AnthropicProvider);
//# sourceMappingURL=anthropic.provider.js.map