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
var OpenAIProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
const base_llm_provider_1 = require("./base-llm.provider");
let OpenAIProvider = OpenAIProvider_1 = class OpenAIProvider extends base_llm_provider_1.BaseLLMProvider {
    constructor() {
        super();
        this.name = 'openai';
        this.apiVersion = 'v1';
        this.logger = new common_1.Logger(OpenAIProvider_1.name);
    }
    createClient(apiKey) {
        return new openai_1.default({
            apiKey,
            timeout: 30000,
            maxRetries: 2
        });
    }
    async generateTest(prompt, apiKey) {
        const client = this.createClient(apiKey);
        const formattedPrompt = this.formatPromptForMCP(prompt);
        try {
            this.logger.debug(`Gerando teste com OpenAI, tokens estimados: ${this.estimateTokens(formattedPrompt)}`);
            const completion = await client.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: prompt.system },
                    { role: 'user', content: formattedPrompt }
                ],
                temperature: 0.1,
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('Resposta vazia do OpenAI');
            }
            this.logger.debug(`Resposta recebida do OpenAI: ${response.substring(0, 200)}...`);
            const result = this.parseResponse(response);
            result.metadata.tokensUsed = completion.usage?.total_tokens || this.estimateTokens(response);
            result.metadata.model = 'gpt-4';
            return result;
        }
        catch (error) {
            this.logger.error(`Erro ao gerar teste com OpenAI: ${error.message}`);
            throw this.handleApiError(error, 'OpenAI');
        }
    }
    async validateApiKey(apiKey) {
        try {
            const client = this.createClient(apiKey);
            await client.models.list();
            this.logger.debug('API Key OpenAI validada com sucesso');
            return true;
        }
        catch (error) {
            this.logger.warn(`Falha na validação da API Key OpenAI: ${error.message}`);
            return false;
        }
    }
    getSupportedModels() {
        return [
            'gpt-4',
            'gpt-4-turbo',
            'gpt-4-turbo-preview',
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-16k'
        ];
    }
    async generateTestWithModel(prompt, apiKey, model = 'gpt-4') {
        const client = this.createClient(apiKey);
        const formattedPrompt = this.formatPromptForMCP(prompt);
        try {
            const completion = await client.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: prompt.system },
                    { role: 'user', content: formattedPrompt }
                ],
                temperature: 0.1,
                max_tokens: model.includes('gpt-4') ? 2000 : 1500,
                response_format: { type: 'json_object' }
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('Resposta vazia do OpenAI');
            }
            const result = this.parseResponse(response);
            result.metadata.tokensUsed = completion.usage?.total_tokens || this.estimateTokens(response);
            result.metadata.model = model;
            return result;
        }
        catch (error) {
            throw this.handleApiError(error, 'OpenAI');
        }
    }
};
exports.OpenAIProvider = OpenAIProvider;
exports.OpenAIProvider = OpenAIProvider = OpenAIProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OpenAIProvider);
//# sourceMappingURL=openai.provider.js.map