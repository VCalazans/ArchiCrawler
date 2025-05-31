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
var GeminiProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const base_llm_provider_1 = require("./base-llm.provider");
let GeminiProvider = GeminiProvider_1 = class GeminiProvider extends base_llm_provider_1.BaseLLMProvider {
    constructor() {
        super();
        this.name = 'gemini';
        this.apiVersion = 'v1';
        this.logger = new common_1.Logger(GeminiProvider_1.name);
    }
    createClient(apiKey) {
        return new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async generateTest(prompt, apiKey) {
        const genAI = this.createClient(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const formattedPrompt = this.formatPromptForMCP(prompt);
        const fullPrompt = `${prompt.system}\n\n${formattedPrompt}`;
        try {
            this.logger.debug(`Gerando teste com Gemini, tokens estimados: ${this.estimateTokens(formattedPrompt)}`);
            const result = await model.generateContent(fullPrompt);
            const response = result.response.text();
            if (!response) {
                throw new Error('Resposta vazia do Gemini');
            }
            this.logger.debug(`Resposta recebida do Gemini: ${response.substring(0, 200)}...`);
            const parsedResult = this.parseResponse(response);
            parsedResult.metadata.tokensUsed = this.estimateTokens(response);
            parsedResult.metadata.model = 'gemini-pro';
            return parsedResult;
        }
        catch (error) {
            this.logger.error(`Erro ao gerar teste com Gemini: ${error.message}`);
            throw this.handleApiError(error, 'Gemini');
        }
    }
    async validateApiKey(apiKey) {
        try {
            const genAI = this.createClient(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            await model.generateContent('Hi');
            this.logger.debug('API Key Gemini validada com sucesso');
            return true;
        }
        catch (error) {
            this.logger.warn(`Falha na validação da API Key Gemini: ${error.message}`);
            return false;
        }
    }
    getSupportedModels() {
        return [
            'gemini-pro',
            'gemini-pro-vision',
            'gemini-1.5-pro',
            'gemini-1.5-flash'
        ];
    }
    async generateTestWithModel(prompt, apiKey, model = 'gemini-pro') {
        const genAI = this.createClient(apiKey);
        const generativeModel = genAI.getGenerativeModel({ model });
        const formattedPrompt = this.formatPromptForMCP(prompt);
        const fullPrompt = `${prompt.system}\n\n${formattedPrompt}`;
        try {
            const result = await generativeModel.generateContent(fullPrompt);
            const response = result.response.text();
            if (!response) {
                throw new Error('Resposta vazia do Gemini');
            }
            const parsedResult = this.parseResponse(response);
            parsedResult.metadata.tokensUsed = this.estimateTokens(response);
            parsedResult.metadata.model = model;
            return parsedResult;
        }
        catch (error) {
            throw this.handleApiError(error, 'Gemini');
        }
    }
    parseResponse(response) {
        try {
            let cleanResponse = response.replace(/```json\s*|\s*```/g, '').trim();
            if (!cleanResponse.startsWith('{')) {
                const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    cleanResponse = jsonMatch[0];
                }
            }
            const parsed = JSON.parse(cleanResponse);
            if (!parsed.testCode || !parsed.mcpCommands || !Array.isArray(parsed.mcpCommands)) {
                throw new Error('Resposta não possui estrutura válida');
            }
            return {
                testCode: parsed.testCode,
                mcpCommands: parsed.mcpCommands || [],
                metadata: {
                    tokensUsed: this.estimateTokens(response),
                    model: this.name,
                    provider: this.name,
                    confidence: parsed.metadata?.confidence || 70
                }
            };
        }
        catch (error) {
            throw new Error(`Erro ao parsear resposta do Gemini: ${error.message}`);
        }
    }
};
exports.GeminiProvider = GeminiProvider;
exports.GeminiProvider = GeminiProvider = GeminiProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiProvider);
//# sourceMappingURL=gemini.provider.js.map