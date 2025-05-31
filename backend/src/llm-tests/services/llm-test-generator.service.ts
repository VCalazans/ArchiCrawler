import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneratedTest } from '../entities/generated-test.entity';
import { TestGenerationRequest } from '../interfaces/test-generation.interface';
import { LLMProviderFactory } from './llm-provider.factory';
import { TestPromptBuilderService } from './test-prompt-builder.service';
import { ApiKeyManagerService } from './api-key-manager.service';
import { TestValidatorService } from './test-validator.service';

@Injectable()
export class LLMTestGeneratorService {
  private readonly logger = new Logger(LLMTestGeneratorService.name);

  constructor(
    @InjectRepository(GeneratedTest)
    private generatedTestRepository: Repository<GeneratedTest>,
    private llmProviderFactory: LLMProviderFactory,
    private promptBuilder: TestPromptBuilderService,
    private apiKeyManager: ApiKeyManagerService,
    private testValidator: TestValidatorService,
  ) {}

  async generateTest(request: TestGenerationRequest): Promise<GeneratedTest> {
    this.logger.log(`Iniciando geração de teste para usuário ${request.userId}`);
    
    try {
      // 1. Validar entrada
      this.validateRequest(request);

      // 2. Buscar API key do usuário
      const apiKey = await this.apiKeyManager.getDecryptedApiKey(
        request.userId, 
        request.llmProvider
      );

      if (!apiKey) {
        throw new Error(`API key não encontrada para provedor ${request.llmProvider}`);
      }

      // 3. Criar prompt estruturado
      const prompt = this.promptBuilder.buildPrompt(request);
      this.logger.debug(`Prompt criado para ${request.testType}: ${prompt.user.substring(0, 100)}...`);

      // 4. Gerar teste usando LLM
      const provider = this.llmProviderFactory.createProvider(request.llmProvider);
      const generatedResult = await provider.generateTest(prompt, apiKey);
      
      this.logger.debug(`Teste gerado com ${generatedResult.mcpCommands.length} comandos MCP`);

      // 5. Validar teste gerado
      const validationResult = await this.testValidator.validateGeneratedTest(generatedResult);
      
      this.logger.debug(`Validação concluída - Score: ${validationResult.score}%`);

      // 6. Salvar no banco
      const generatedTest = this.generatedTestRepository.create({
        userId: request.userId,
        name: this.generateTestName(request),
        description: request.testDescription,
        targetUrl: request.targetUrl,
        testType: request.testType,
        llmProvider: request.llmProvider,
        model: request.model || 'default',
        originalPrompt: prompt,
        generatedCode: generatedResult.testCode,
        mcpCommands: generatedResult.mcpCommands,
        validationResult,
        status: validationResult.isValid ? 'validated' : 'draft',
        metadata: {
          tokensUsed: generatedResult.metadata.tokensUsed,
          confidence: generatedResult.metadata.confidence,
          estimatedDuration: generatedResult.metadata.estimatedDuration || 'N/A'
        }
      });

      const savedTest = await this.generatedTestRepository.save(generatedTest);
      
      this.logger.log(`Teste gerado e salvo com ID: ${savedTest.id}`);
      return savedTest;

    } catch (error) {
      this.logger.error(`Erro ao gerar teste: ${error.message}`);
      throw error;
    }
  }

  private validateRequest(request: TestGenerationRequest): void {
    const requiredFields = ['targetUrl', 'testDescription', 'testType', 'llmProvider', 'userId'];
    
    for (const field of requiredFields) {
      if (!request[field]) {
        throw new Error(`Campo obrigatório ausente: ${field}`);
      }
    }

    if (!['e2e', 'visual', 'performance', 'accessibility'].includes(request.testType)) {
      throw new Error('Tipo de teste inválido');
    }

    // Validar URL
    try {
      new URL(request.targetUrl);
    } catch {
      throw new Error('URL de destino inválida');
    }

    // Validar provedor
    const supportedProviders = this.llmProviderFactory.getSupportedProviderNames();
    if (!supportedProviders.includes(request.llmProvider)) {
      throw new Error(`Provedor não suportado: ${request.llmProvider}. Disponíveis: ${supportedProviders.join(', ')}`);
    }
  }

  private generateTestName(request: TestGenerationRequest): string {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const domain = new URL(request.targetUrl).hostname;
    return `Teste ${request.testType.toUpperCase()} - ${domain} - ${timestamp}`;
  }

  async getGeneratedTests(userId: string, filters?: {
    testType?: string;
    status?: string;
    llmProvider?: string;
    limit?: number;
  }): Promise<GeneratedTest[]> {
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
    } catch (error) {
      this.logger.error(`Erro ao buscar testes: ${error.message}`);
      throw new Error('Falha ao buscar testes gerados');
    }
  }

  async getTestById(id: string, userId: string): Promise<GeneratedTest> {
    try {
      const test = await this.generatedTestRepository.findOne({
        where: { id, userId }
      });

      if (!test) {
        throw new Error('Teste não encontrado');
      }

      return test;
    } catch (error) {
      this.logger.error(`Erro ao buscar teste ${id}: ${error.message}`);
      throw error;
    }
  }

  async updateTestStatus(id: string, userId: string, status: string): Promise<GeneratedTest> {
    try {
      const test = await this.getTestById(id, userId);
      
      const validStatuses = ['draft', 'validated', 'active', 'failed', 'archived'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Status inválido: ${status}`);
      }

      test.status = status as any;
      return await this.generatedTestRepository.save(test);
    } catch (error) {
      this.logger.error(`Erro ao atualizar status do teste ${id}: ${error.message}`);
      throw error;
    }
  }

  async deleteTest(id: string, userId: string): Promise<void> {
    try {
      const result = await this.generatedTestRepository.delete({
        id,
        userId
      });

      if (result.affected === 0) {
        throw new Error('Teste não encontrado');
      }

      this.logger.log(`Teste ${id} removido pelo usuário ${userId}`);
    } catch (error) {
      this.logger.error(`Erro ao remover teste ${id}: ${error.message}`);
      throw error;
    }
  }

  async getTestStatistics(userId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byProvider: Record<string, number>;
  }> {
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
        // Por tipo
        stats.byType[test.testType] = (stats.byType[test.testType] || 0) + 1;
        
        // Por status
        stats.byStatus[test.status] = (stats.byStatus[test.status] || 0) + 1;
        
        // Por provider
        stats.byProvider[test.llmProvider] = (stats.byProvider[test.llmProvider] || 0) + 1;
      });

      return stats;
    } catch (error) {
      this.logger.error(`Erro ao obter estatísticas: ${error.message}`);
      throw new Error('Falha ao obter estatísticas');
    }
  }

  async regenerateTest(id: string, userId: string): Promise<GeneratedTest> {
    try {
      const existingTest = await this.getTestById(id, userId);
      
      // Criar nova requisição baseada no teste existente
      const request: TestGenerationRequest = {
        targetUrl: existingTest.targetUrl,
        testDescription: existingTest.description,
        testType: existingTest.testType as any,
        llmProvider: existingTest.llmProvider,
        model: existingTest.model,
        userId: existingTest.userId,
        additionalContext: existingTest.originalPrompt?.context
      };

      // Gerar novo teste
      const newTest = await this.generateTest(request);
      
      // Arquivar o teste anterior
      await this.updateTestStatus(id, userId, 'archived');
      
      this.logger.log(`Teste ${id} regenerado como ${newTest.id}`);
      return newTest;
    } catch (error) {
      this.logger.error(`Erro ao regenerar teste ${id}: ${error.message}`);
      throw error;
    }
  }
} 