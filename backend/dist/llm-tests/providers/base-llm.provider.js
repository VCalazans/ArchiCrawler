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

RESPOSTA ESPERADA: JSON válido com a estrutura EXATA:
{
  "testName": "Nome descritivo do teste",
  "description": "Descrição do que o teste faz",
  "mcpCommands": [
    {
      "action": "navigate",
      "url": "URL_COMPLETA",
      "description": "Navegar para a página",
      "timeout": 30000
    },
    {
      "action": "screenshot", 
      "name": "inicial",
      "description": "Screenshot inicial"
    },
    {
      "action": "wait",
      "value": "2000",
      "description": "Aguardar carregamento"
    }
  ],
  "expectedResults": [
    "O que deve acontecer no teste",
    "Verificações esperadas"
  ],
  "metadata": {
    "confidence": 85,
    "estimatedDuration": "30s",
    "tags": ["tipo", "categoria"]
  }
}
    `;
    }
    parseResponse(response) {
        try {
            const cleanResponse = response.replace(/```json\s*|\s*```/g, '').trim();
            const parsed = JSON.parse(cleanResponse);
            if (!parsed.testName && !parsed.description && !parsed.mcpCommands) {
                throw new Error('Resposta não possui estrutura válida. Faltam: testName, description ou mcpCommands');
            }
            if (!Array.isArray(parsed.mcpCommands)) {
                throw new Error('mcpCommands deve ser um array');
            }
            for (const cmd of parsed.mcpCommands) {
                if (!cmd.action) {
                    throw new Error('Comando MCP sem action definida');
                }
            }
            const testCode = JSON.stringify(parsed, null, 2);
            return {
                testCode,
                mcpCommands: parsed.mcpCommands,
                metadata: {
                    tokensUsed: this.estimateTokens(response),
                    model: this.name,
                    provider: this.name,
                    confidence: parsed.metadata?.confidence || 70,
                    testName: parsed.testName,
                    description: parsed.description,
                    estimatedDuration: parsed.metadata?.estimatedDuration || '30s',
                    expectedResults: parsed.expectedResults || [],
                    tags: parsed.metadata?.tags || [],
                    readableCode: this.generateReadableTestCode(parsed)
                }
            };
        }
        catch (error) {
            throw new Error(`Erro ao parsear resposta do LLM: ${error.message}`);
        }
    }
    generateReadableTestCode(parsed) {
        const commands = parsed.mcpCommands || [];
        let code = `// ${parsed.testName || 'Teste Gerado'}\n`;
        code += `// ${parsed.description || 'Teste automatizado'}\n\n`;
        commands.forEach((cmd, index) => {
            const step = index + 1;
            const description = cmd.description || `${cmd.action} command`;
            code += `// Passo ${step}: ${description}\n`;
            switch (cmd.action) {
                case 'navigate':
                    code += `await page.goto('${cmd.url}', { timeout: ${cmd.timeout || 30000} });\n`;
                    break;
                case 'click':
                    code += `await page.click('${cmd.selector}', { timeout: ${cmd.timeout || 10000} });\n`;
                    break;
                case 'fill':
                    code += `await page.fill('${cmd.selector}', '${cmd.value}', { timeout: ${cmd.timeout || 10000} });\n`;
                    break;
                case 'screenshot':
                    const screenshotOptions = cmd.fullPage ? ', { fullPage: true }' : '';
                    code += `await page.screenshot({ path: '${cmd.name || 'screenshot'}.png'${screenshotOptions} });\n`;
                    break;
                case 'wait':
                    code += `await page.waitForTimeout(${cmd.value || 1000});\n`;
                    break;
                case 'hover':
                    code += `await page.hover('${cmd.selector}', { timeout: ${cmd.timeout || 10000} });\n`;
                    break;
                case 'select':
                    code += `await page.selectOption('${cmd.selector}', '${cmd.value}', { timeout: ${cmd.timeout || 10000} });\n`;
                    break;
                default:
                    code += `// ${cmd.action}: ${JSON.stringify(cmd)}\n`;
            }
            code += '\n';
        });
        return code;
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