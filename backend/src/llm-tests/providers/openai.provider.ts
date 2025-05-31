import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { BaseLLMProvider } from './base-llm.provider';
import { TestPrompt, GeneratedTestResult } from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenAIProvider extends BaseLLMProvider {
  readonly name = 'openai';
  readonly apiVersion = 'v1';
  
  private readonly logger = new Logger(OpenAIProvider.name);
  
  constructor() {
    super();
  }

  private createClient(apiKey: string): OpenAI {
    return new OpenAI({ 
      apiKey,
      timeout: 30000,
      maxRetries: 2
    });
  }

  async generateTest(prompt: TestPrompt, apiKey: string): Promise<GeneratedTestResult> {
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
    } catch (error) {
      this.logger.error(`Erro ao gerar teste com OpenAI: ${error.message}`);
      throw this.handleApiError(error, 'OpenAI');
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const client = this.createClient(apiKey);
      await client.models.list();
      this.logger.debug('API Key OpenAI validada com sucesso');
      return true;
    } catch (error) {
      this.logger.warn(`Falha na validação da API Key OpenAI: ${error.message}`);
      return false;
    }
  }

  getSupportedModels(): string[] {
    return [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4-turbo-preview',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k'
    ];
  }

  async generateTestWithModel(prompt: TestPrompt, apiKey: string, model: string = 'gpt-4'): Promise<GeneratedTestResult> {
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
    } catch (error) {
      throw this.handleApiError(error, 'OpenAI');
    }
  }
} 