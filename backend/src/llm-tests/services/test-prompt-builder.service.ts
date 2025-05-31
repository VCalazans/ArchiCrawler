import { Injectable } from '@nestjs/common';
import { TestGenerationRequest } from '../interfaces/test-generation.interface';
import { TestPrompt } from '../interfaces/llm-provider.interface';

@Injectable()
export class TestPromptBuilderService {
  buildPrompt(request: TestGenerationRequest): TestPrompt {
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

  private getSystemPrompt(): string {
    return `
Você é um especialista em automação de testes web usando Playwright e MCP (Model Context Protocol).
Sua tarefa é gerar testes automatizados precisos, robustos e eficientes.

REGRAS IMPORTANTES:
1. Use APENAS comandos MCP válidos: navigate, click, fill, screenshot, wait, assert, hover, select
2. Seletores devem ser robustos (prefira data-testid, fallback para CSS específicos)
3. Inclua capturas de tela em pontos críticos do teste
4. Adicione waits apropriados para elementos carregarem
5. Implemente validações para verificar o sucesso das ações
6. Use timeouts adequados para evitar falhas por lentidão
7. Teste deve ser idempotente (pode ser executado múltiplas vezes)
8. Adicione comentários explicativos no código gerado
9. Trate erros graciosamente

COMANDOS MCP DISPONÍVEIS:
- navigate: Navegar para uma URL
- click: Clicar em um elemento
- fill: Preencher campo de texto
- screenshot: Capturar tela
- wait: Aguardar elemento ou tempo
- assert: Validar conteúdo ou estado
- hover: Passar mouse sobre elemento
- select: Selecionar opção em dropdown

FORMATO DE RESPOSTA: JSON válido com estrutura exata:
{
  "testCode": "string - código do teste em formato legível com comentários",
  "mcpCommands": [
    {
      "action": "navigate",
      "url": "URL",
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
    "description": "Descrição do que o teste faz",
    "estimatedDuration": "30s"
  }
}
    `;
  }

  private buildUserPrompt(request: TestGenerationRequest): string {
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

  private getTestTypeDescription(testType: string): string {
    const descriptions = {
      'e2e': 'Teste end-to-end que simula jornada completa do usuário',
      'visual': 'Teste de regressão visual comparando screenshots',
      'performance': 'Teste de performance medindo carregamento e responsividade',
      'accessibility': 'Teste de acessibilidade verificando padrões WCAG'
    };

    return descriptions[testType] || 'Teste funcional básico';
  }

  private getTypeSpecificInstructions(testType: string): string {
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

  private getExamples(testType: string): any[] {
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

  buildCustomPrompt(
    systemInstructions: string,
    userRequest: string,
    examples?: any[],
    context?: string
  ): TestPrompt {
    return {
      system: systemInstructions,
      user: userRequest,
      examples: examples || [],
      context
    };
  }

  validatePrompt(prompt: TestPrompt): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

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
} 