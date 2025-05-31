import { Injectable, Logger } from '@nestjs/common';
import { OpenAIProvider } from '../providers/openai.provider';
import { AnthropicProvider } from '../providers/anthropic.provider';
import { GeminiProvider } from '../providers/gemini.provider';
import { LLMProvider } from '../interfaces/llm-provider.interface';

@Injectable()
export class LLMProviderFactory {
  private readonly logger = new Logger(LLMProviderFactory.name);

  constructor(
    private readonly openaiProvider: OpenAIProvider,
    private readonly anthropicProvider: AnthropicProvider,
    private readonly geminiProvider: GeminiProvider,
  ) {}

  createProvider(providerName: string): LLMProvider {
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

  getAvailableProviders(): Array<{name: string, models: string[], description: string}> {
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

  async validateProviderSupport(providerName: string): Promise<boolean> {
    try {
      this.createProvider(providerName);
      return true;
    } catch (error) {
      this.logger.warn(`Provider não suportado: ${providerName}`);
      return false;
    }
  }

  getProviderByName(providerName: string): LLMProvider | null {
    try {
      return this.createProvider(providerName);
    } catch (error) {
      return null;
    }
  }

  getSupportedProviderNames(): string[] {
    return this.getAvailableProviders().map(provider => provider.name);
  }
} 