"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestPromptBuilderService = void 0;
const common_1 = require("@nestjs/common");
let TestPromptBuilderService = class TestPromptBuilderService {
    buildPrompt(request) {
        const systemPrompt = this.getSystemPrompt();
        const userPrompt = this.buildUserPrompt(request);
        const examples = this.getExamples(request.testType);
        return {
            system: systemPrompt,
            user: userPrompt,
            examples,
            context: request.additionalContext
        };
    }
    getSystemPrompt() {
        return `
Você é um especialista em automação de testes web usando Playwright via MCP (Model Context Protocol).
Sua tarefa é gerar testes automatizados precisos que serão executados pelo ArchiCrawler.

IMPORTANTE: O teste será executado via MCP Playwright. Comandos devem ser EXATOS e FUNCIONAIS.

COMANDOS MCP PLAYWRIGHT DISPONÍVEIS:
- navigate: { action: "navigate", url: "string", timeout?: number }
- click: { action: "click", selector: "string", timeout?: number }
- fill: { action: "fill", selector: "string", value: "string", timeout?: number }
- screenshot: { action: "screenshot", name?: "string", fullPage?: boolean }
- wait: { action: "wait", value: "milliseconds_string", timeout?: number }
- hover: { action: "hover", selector: "string", timeout?: number }
- select: { action: "select", selector: "string", value: "string", timeout?: number }
- press_key: { action: "press_key", key: "string", selector?: "string" }
- get_text: { action: "get_text" }
- evaluate: { action: "evaluate", script: "javascript_code" }

REGRAS PARA SELETORES:
1. PREFIRA: [data-testid="nome"], [data-cy="nome"], [data-qa="nome"]
2. FALLBACK: CSS seletores específicos (#id, .class, input[type="email"])
3. EVITE: XPath, seletores muito genéricos (div, span)
4. TESTE: button[type="submit"], input[name="email"], a[href*="/login"]

ESTRUTURA JSON OBRIGATÓRIA:
{
  "testName": "Nome do teste",
  "description": "O que o teste faz",
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
    "tags": ["e2e", "login", "etc"]
  }
}

SEMPRE inclua:
- Screenshot inicial após navegação
- Waits apropriados entre ações
- Screenshot final
- Timeouts realistas (30s navegação, 10s cliques)
- Descrições claras para cada comando
    `;
    }
    buildUserPrompt(request) {
        return `
GERAR TESTE ${request.testType.toUpperCase()}

URL Alvo: ${request.targetUrl}
Descrição: ${request.testDescription}

Tipo de Teste: ${this.getTestTypeDescription(request.testType)}

${request.additionalContext ? `Contexto Adicional: ${request.additionalContext}` : ''}

INSTRUÇÕES ESPECÍFICAS:
${this.getTypeSpecificInstructions(request.testType)}

Por favor, gere um teste completo e funcional seguindo as melhores práticas.
    `;
    }
    getTestTypeDescription(testType) {
        const descriptions = {
            'e2e': 'Teste end-to-end que simula jornada completa do usuário',
            'visual': 'Teste de regressão visual comparando screenshots',
            'performance': 'Teste de performance medindo carregamento e responsividade',
            'accessibility': 'Teste de acessibilidade verificando padrões WCAG'
        };
        return descriptions[testType] || 'Teste funcional básico';
    }
    getTypeSpecificInstructions(testType) {
        const instructions = {
            'e2e': `
- Simule uma jornada completa do usuário
- Inclua interações com formulários, navegação e validações
- Capture telas antes e depois de ações importantes
- Verifique estados e conteúdos esperados`,
            'visual': `
- Foque em capturar screenshots em diferentes estados
- Use fullPage: true para capturas completas
- Inclua screenshots de elementos específicos se necessário
- Aguarde carregamento completo antes das capturas`,
            'performance': `
- Meça tempos de carregamento
- Use timeouts apropriados
- Capture métricas de performance quando possível
- Teste responsividade em diferentes resoluções`,
            'accessibility': `
- Verifique elementos focáveis
- Teste navegação por teclado
- Valide textos alternativos
- Confirme contraste e legibilidade`
        };
        return instructions[testType] || 'Siga as melhores práticas gerais de teste';
    }
    getExamples(testType) {
        const examples = {
            'e2e': [
                {
                    scenario: 'Login e navegação',
                    commands: [
                        { action: 'navigate', url: 'https://example.com/login', timeout: 30000 },
                        { action: 'screenshot', name: 'login-page' },
                        { action: 'fill', selector: '[data-testid="email"]', value: 'user@example.com' },
                        { action: 'fill', selector: '[data-testid="password"]', value: 'password' },
                        { action: 'click', selector: '[data-testid="login-button"]' },
                        { action: 'wait', selector: '[data-testid="dashboard"]', timeout: 10000 },
                        { action: 'screenshot', name: 'dashboard' }
                    ]
                }
            ],
            'visual': [
                {
                    scenario: 'Captura visual completa',
                    commands: [
                        { action: 'navigate', url: 'https://example.com', timeout: 30000 },
                        { action: 'wait', timeout: 3000 },
                        { action: 'screenshot', name: 'homepage-full', fullPage: true }
                    ]
                }
            ],
            'performance': [
                {
                    scenario: 'Teste de carregamento',
                    commands: [
                        { action: 'navigate', url: 'https://example.com', timeout: 15000 },
                        { action: 'wait', selector: 'main', timeout: 10000 },
                        { action: 'screenshot', name: 'loaded-page' }
                    ]
                }
            ],
            'accessibility': [
                {
                    scenario: 'Teste de acessibilidade',
                    commands: [
                        { action: 'navigate', url: 'https://example.com', timeout: 30000 },
                        { action: 'screenshot', name: 'accessibility-check' },
                        { action: 'assert', selector: '[alt]', value: 'has-alt-text' }
                    ]
                }
            ]
        };
        return examples[testType] || [];
    }
    buildCustomPrompt(systemInstructions, userRequest, examples, context) {
        return {
            system: systemInstructions,
            user: userRequest,
            examples: examples || [],
            context
        };
    }
    validatePrompt(prompt) {
        const errors = [];
        if (!prompt.system || prompt.system.trim().length === 0) {
            errors.push('Prompt do sistema é obrigatório');
        }
        if (!prompt.user || prompt.user.trim().length === 0) {
            errors.push('Prompt do usuário é obrigatório');
        }
        if (prompt.system && prompt.system.length > 10000) {
            errors.push('Prompt do sistema muito longo (máximo 10000 caracteres)');
        }
        if (prompt.user && prompt.user.length > 5000) {
            errors.push('Prompt do usuário muito longo (máximo 5000 caracteres)');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
};
exports.TestPromptBuilderService = TestPromptBuilderService;
exports.TestPromptBuilderService = TestPromptBuilderService = __decorate([
    (0, common_1.Injectable)()
], TestPromptBuilderService);
//# sourceMappingURL=test-prompt-builder.service.js.map