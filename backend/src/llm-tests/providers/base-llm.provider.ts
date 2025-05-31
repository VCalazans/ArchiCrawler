import { Injectable } from '@nestjs/common';
import { LLMProvider, TestPrompt, GeneratedTestResult } from '../interfaces/llm-provider.interface';

@Injectable()
export abstract class BaseLLMProvider implements LLMProvider {
  abstract readonly name: string;
  abstract readonly apiVersion: string;

  abstract generateTest(prompt: TestPrompt, apiKey: string): Promise<GeneratedTestResult>;
  abstract validateApiKey(apiKey: string): Promise<boolean>;
  abstract getSupportedModels(): string[];

  estimateTokens(prompt: string): number {
    // Estimativa baseada em caracteres (aproximada: ~4 chars = 1 token)
    return Math.ceil(prompt.length / 4);
  }

  protected formatPromptForMCP(prompt: TestPrompt): string {
    return `
${prompt.system}

Contexto do Teste:
${prompt.user}

${prompt.context ? `Contexto Adicional: ${prompt.context}` : ''}

RESPOSTA ESPERADA: JSON válido com a estrutura exata:
{
  "testCode": "código do teste gerado em formato legível",
  "mcpCommands": [
    {
      "action": "navigate",
      "url": "URL_DESTINO",
      "timeout": 30000
    },
    {
      "action": "screenshot", 
      "name": "inicial"
    },
    {
      "action": "click",
      "selector": "[data-testid='button']",
      "timeout": 5000
    }
  ],
  "metadata": {
    "confidence": 85,
    "description": "descrição do que o teste faz",
    "estimatedDuration": "30s"
  }
}
    `;
  }

  protected parseResponse(response: string): GeneratedTestResult {
    try {
      // Remover possíveis caracteres de markdown
      const cleanResponse = response.replace(/```json\s*|\s*```/g, '').trim();
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
      throw new Error(`Erro ao parsear resposta do LLM: ${error.message}`);
    }
  }

  protected handleApiError(error: any, providerName: string): Error {
    if (error.response?.status === 401) {
      return new Error(`Chave API inválida para ${providerName}`);
    } else if (error.response?.status === 429) {
      return new Error(`Rate limit excedido para ${providerName}`);
    } else if (error.response?.status >= 500) {
      return new Error(`Erro interno do servidor ${providerName}`);
    } else {
      return new Error(`Erro ${providerName}: ${error.message}`);
    }
  }
} 