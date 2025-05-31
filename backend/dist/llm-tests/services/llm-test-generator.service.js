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
var LLMTestGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMTestGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const generated_test_entity_1 = require("../entities/generated-test.entity");
const llm_provider_factory_1 = require("./llm-provider.factory");
const test_prompt_builder_service_1 = require("./test-prompt-builder.service");
const api_key_manager_service_1 = require("./api-key-manager.service");
const test_validator_service_1 = require("./test-validator.service");
let LLMTestGeneratorService = LLMTestGeneratorService_1 = class LLMTestGeneratorService {
    constructor(generatedTestRepository, llmProviderFactory, promptBuilder, apiKeyManager, testValidator) {
        this.generatedTestRepository = generatedTestRepository;
        this.llmProviderFactory = llmProviderFactory;
        this.promptBuilder = promptBuilder;
        this.apiKeyManager = apiKeyManager;
        this.testValidator = testValidator;
        this.logger = new common_1.Logger(LLMTestGeneratorService_1.name);
    }
    async generateTest(request) {
        this.logger.log(`Iniciando geração de teste para usuário ${request.userId}`);
        try {
            this.validateRequest(request);
            const apiKey = await this.apiKeyManager.getDecryptedApiKey(request.userId, request.llmProvider);
            if (!apiKey) {
                throw new Error(`API key não encontrada para provedor ${request.llmProvider}`);
            }
            const prompt = this.promptBuilder.buildPrompt(request);
            this.logger.debug(`Prompt criado para ${request.testType}: ${prompt.user.substring(0, 100)}...`);
            const provider = this.llmProviderFactory.createProvider(request.llmProvider);
            const generatedResult = await provider.generateTest(prompt, apiKey);
            this.logger.debug(`Teste gerado com ${generatedResult.mcpCommands.length} comandos MCP`);
            const validationResult = await this.testValidator.validateGeneratedTest(generatedResult);
            this.logger.debug(`Validação concluída - Score: ${validationResult.score}%`);
            const generatedTest = this.generatedTestRepository.create({
                userId: request.userId,
                name: this.generateTestName(request),
                description: request.testDescription,
                targetUrl: request.targetUrl,
                testType: request.testType,
                llmProvider: request.llmProvider,
                model: request.model || 'default',
                originalPrompt: {
                    system: prompt.system,
                    user: prompt.user,
                    context: request.additionalContext
                },
                generatedCode: generatedResult.testCode,
                mcpCommands: generatedResult.mcpCommands,
                validationResult: null,
                status: 'draft',
                metadata: {
                    tokensUsed: generatedResult.metadata.tokensUsed,
                    confidence: generatedResult.metadata.confidence,
                    estimatedDuration: generatedResult.metadata.estimatedDuration || 'N/A'
                }
            });
            const savedTest = await this.generatedTestRepository.save(generatedTest);
            this.logger.log(`Teste gerado e salvo com ID: ${savedTest.id}`);
            return savedTest;
        }
        catch (error) {
            this.logger.error(`Erro ao gerar teste: ${error.message}`);
            throw error;
        }
    }
    validateRequest(request) {
        const requiredFields = ['targetUrl', 'testDescription', 'testType', 'llmProvider', 'userId'];
        for (const field of requiredFields) {
            if (!request[field]) {
                throw new Error(`Campo obrigatório ausente: ${field}`);
            }
        }
        if (!['e2e', 'visual', 'performance', 'accessibility'].includes(request.testType)) {
            throw new Error('Tipo de teste inválido');
        }
        try {
            new URL(request.targetUrl);
        }
        catch {
            throw new Error('URL de destino inválida');
        }
        const supportedProviders = this.llmProviderFactory.getSupportedProviderNames();
        if (!supportedProviders.includes(request.llmProvider)) {
            throw new Error(`Provedor não suportado: ${request.llmProvider}. Disponíveis: ${supportedProviders.join(', ')}`);
        }
    }
    generateTestName(request) {
        const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const domain = new URL(request.targetUrl).hostname;
        return `Teste ${request.testType.toUpperCase()} - ${domain} - ${timestamp}`;
    }
    async getGeneratedTests(userId, filters) {
        try {
            const queryBuilder = this.generatedTestRepository
                .createQueryBuilder('test')
                .where('test.userId = :userId', { userId })
                .orderBy('test.createdAt', 'DESC');
            if (filters?.testType) {
                queryBuilder.andWhere('test.testType = :testType', { testType: filters.testType });
            }
            if (filters?.status) {
                queryBuilder.andWhere('test.status = :status', { status: filters.status });
            }
            if (filters?.llmProvider) {
                queryBuilder.andWhere('test.llmProvider = :llmProvider', { llmProvider: filters.llmProvider });
            }
            if (filters?.limit) {
                queryBuilder.limit(filters.limit);
            }
            return await queryBuilder.getMany();
        }
        catch (error) {
            this.logger.error(`Erro ao buscar testes: ${error.message}`);
            throw new Error('Falha ao buscar testes gerados');
        }
    }
    async getTestById(id, userId) {
        try {
            const test = await this.generatedTestRepository.findOne({
                where: { id, userId }
            });
            if (!test) {
                throw new Error('Teste não encontrado');
            }
            return test;
        }
        catch (error) {
            this.logger.error(`Erro ao buscar teste ${id}: ${error.message}`);
            throw error;
        }
    }
    async updateTestStatus(id, userId, status) {
        try {
            const test = await this.getTestById(id, userId);
            const validStatuses = ['draft', 'validated', 'active', 'failed', 'archived'];
            if (!validStatuses.includes(status)) {
                throw new Error(`Status inválido: ${status}`);
            }
            test.status = status;
            return await this.generatedTestRepository.save(test);
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar status do teste ${id}: ${error.message}`);
            throw error;
        }
    }
    async deleteTest(id, userId) {
        try {
            const result = await this.generatedTestRepository.delete({
                id,
                userId
            });
            if (result.affected === 0) {
                throw new Error('Teste não encontrado');
            }
            this.logger.log(`Teste ${id} removido pelo usuário ${userId}`);
        }
        catch (error) {
            this.logger.error(`Erro ao remover teste ${id}: ${error.message}`);
            throw error;
        }
    }
    async getTestStatistics(userId) {
        try {
            const tests = await this.generatedTestRepository.find({
                where: { userId }
            });
            const stats = {
                total: tests.length,
                byType: {},
                byStatus: {},
                byProvider: {}
            };
            tests.forEach(test => {
                stats.byType[test.testType] = (stats.byType[test.testType] || 0) + 1;
                stats.byStatus[test.status] = (stats.byStatus[test.status] || 0) + 1;
                stats.byProvider[test.llmProvider] = (stats.byProvider[test.llmProvider] || 0) + 1;
            });
            return stats;
        }
        catch (error) {
            this.logger.error(`Erro ao obter estatísticas: ${error.message}`);
            throw new Error('Falha ao obter estatísticas');
        }
    }
    async regenerateTest(id, userId) {
        try {
            const existingTest = await this.getTestById(id, userId);
            const request = {
                targetUrl: existingTest.targetUrl,
                testDescription: existingTest.description,
                testType: existingTest.testType,
                llmProvider: existingTest.llmProvider,
                model: existingTest.model,
                userId: userId,
                additionalContext: existingTest.originalPrompt?.context
            };
            const newTest = await this.generateTest(request);
            await this.updateTestStatus(id, userId, 'archived');
            this.logger.log(`Teste ${id} regenerado como ${newTest.id}`);
            return newTest;
        }
        catch (error) {
            this.logger.error(`Erro ao regenerar teste ${id}: ${error.message}`);
            throw error;
        }
    }
};
exports.LLMTestGeneratorService = LLMTestGeneratorService;
exports.LLMTestGeneratorService = LLMTestGeneratorService = LLMTestGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(generated_test_entity_1.GeneratedTest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        llm_provider_factory_1.LLMProviderFactory,
        test_prompt_builder_service_1.TestPromptBuilderService,
        api_key_manager_service_1.ApiKeyManagerService,
        test_validator_service_1.TestValidatorService])
], LLMTestGeneratorService);
//# sourceMappingURL=llm-test-generator.service.js.map