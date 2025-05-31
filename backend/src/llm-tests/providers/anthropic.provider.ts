import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { BaseLLMProvider } from './base-llm.provider';
import { TestPrompt, GeneratedTestResult } from '../interfaces/llm-provider.interface';

@Injectable()
export class AnthropicProvider extends BaseLLMProvider {
  readonly name = 'anthropic';
  readonly apiVersion = 'v1';
  
  private readonly logger = new Logger(AnthropicProvider.name);
  
  constructor() {
    super();
  }

  private createClient(apiKey: string): Anthropic {
    return new Anthropic({ 
      apiKey,
      timeout: 30000,
      maxRetries: 2
    });
  }

  async generateTest(prompt: TestPrompt, apiKey: string): Promise<GeneratedTestResult> {
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
      const response = textBlock ? (textBlock as any).text : '';
      if (!response) {
        throw new Error('Resposta vazia do Anthropic');
      }

      this.logger.debug(`Resposta recebida do Anthropic: ${response.substring(0, 200)}...`);
      
      const result = this.parseResponse(response);
      result.metadata.tokensUsed = completion.usage?.output_tokens || this.estimateTokens(response);
      result.metadata.model = 'claude-3-sonnet';

      return result;
    } catch (error) {
      this.logger.error(`Erro ao gerar teste com Anthropic: ${error.message}`);
      throw this.handleApiError(error, 'Anthropic');
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const client = this.createClient(apiKey);
      // Teste simples para validar a chave
      await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      });
      this.logger.debug('API Key Anthropic validada com sucesso');
      return true;
    } catch (error) {
      this.logger.warn(`Falha na validação da API Key Anthropic: ${error.message}`);
      return false;
    }
  }

  getSupportedModels(): string[] {
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0'
    ];
  }

  async generateTestWithModel(prompt: TestPrompt, apiKey: string, model: string = 'claude-3-sonnet-20240229'): Promise<GeneratedTestResult> {
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
      const response = textBlock ? (textBlock as any).text : '';
      if (!response) {
        throw new Error('Resposta vazia do Anthropic');
      }

      const result = this.parseResponse(response);
      result.metadata.tokensUsed = completion.usage?.output_tokens || this.estimateTokens(response);
      result.metadata.model = model;

      return result;
    } catch (error) {
      throw this.handleApiError(error, 'Anthropic');
    }
  }
} 