import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseLLMProvider } from './base-llm.provider';
import { TestPrompt, GeneratedTestResult } from '../interfaces/llm-provider.interface';

@Injectable()
export class GeminiProvider extends BaseLLMProvider {
  readonly name = 'gemini';
  readonly apiVersion = 'v1';
  
  private readonly logger = new Logger(GeminiProvider.name);
  
  constructor() {
    super();
  }

  private createClient(apiKey: string): GoogleGenerativeAI {
    return new GoogleGenerativeAI(apiKey);
  }

  async generateTest(prompt: TestPrompt, apiKey: string): Promise<GeneratedTestResult> {
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
    } catch (error) {
      this.logger.error(`Erro ao gerar teste com Gemini: ${error.message}`);
      throw this.handleApiError(error, 'Gemini');
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const genAI = this.createClient(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      // Teste simples para validar a chave
      await model.generateContent('Hi');
      this.logger.debug('API Key Gemini validada com sucesso');
      return true;
    } catch (error) {
      this.logger.warn(`Falha na validação da API Key Gemini: ${error.message}`);
      return false;
    }
  }

  getSupportedModels(): string[] {
    return [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ];
  }

  async generateTestWithModel(prompt: TestPrompt, apiKey: string, model: string = 'gemini-pro'): Promise<GeneratedTestResult> {
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
    } catch (error) {
      throw this.handleApiError(error, 'Gemini');
    }
  }

  protected parseResponse(response: string): GeneratedTestResult {
    try {
      // Gemini às vezes retorna com markdown, vamos limpar
      let cleanResponse = response.replace(/```json\s*|\s*```/g, '').trim();
      
      // Se ainda não é JSON válido, tentar extrair JSON do texto
      if (!cleanResponse.startsWith('{')) {
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanResponse = jsonMatch[0];
        }
      }
      
      const parsed = JSON.parse(cleanResponse);
      
      // Validar estrutura básica
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
    } catch (error) {
      throw new Error(`Erro ao parsear resposta do Gemini: ${error.message}`);
    }
  }
} 