"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLLMProvider = void 0;
const common_1 = require("@nestjs/common");
let BaseLLMProvider = class BaseLLMProvider {
    estimateTokens(prompt) {
        return Math.ceil(prompt.length / 4);
    }
    formatPromptForMCP(prompt) {
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
    parseResponse(response) {
        try {
            const cleanResponse = response.replace(/```json\s*|\s*```/g, '').trim();
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
            throw new Error(`Erro ao parsear resposta do LLM: ${error.message}`);
        }
    }
    handleApiError(error, providerName) {
        if (error.response?.status === 401) {
            return new Error(`Chave API inválida para ${providerName}`);
        }
        else if (error.response?.status === 429) {
            return new Error(`Rate limit excedido para ${providerName}`);
        }
        else if (error.response?.status >= 500) {
            return new Error(`Erro interno do servidor ${providerName}`);
        }
        else {
            return new Error(`Erro ${providerName}: ${error.message}`);
        }
    }
};
exports.BaseLLMProvider = BaseLLMProvider;
exports.BaseLLMProvider = BaseLLMProvider = __decorate([
    (0, common_1.Injectable)()
], BaseLLMProvider);
//# sourceMappingURL=base-llm.provider.js.map