# 🚀 Guia Prático de Implementação - Módulo LLM Tests

## 📋 Checklist de Desenvolvimento

### ✅ Preparação do Ambiente

```bash
# 1. Instalar dependências adicionais
cd backend
npm install openai @anthropic-ai/sdk @google/generative-ai crypto

# 2. Executar script de revisão inicial
node scripts/llm-tests-review.js infrastructure

# 3. Verificar estrutura do projeto
tree src/llm-tests/  # (se disponível) ou ls -la src/llm-tests/
```

### 🏗️ FASE 1: Infraestrutura (1-2 dias)

#### 1.1 Criar Estrutura de Diretórios
```bash
mkdir -p backend/src/llm-tests/{interfaces,providers,services,controllers,entities,dto}
```

#### 1.2 Implementar Interfaces Base

**📁 `src/llm-tests/interfaces/llm-provider.interface.ts`**
```typescript
export interface TestPrompt {
  system: string;
  user: string;
  examples?: any[];
  context?: string;
}

export interface GeneratedTestResult {
  testCode: string;
  mcpCommands: MCPCommand[];
  metadata: {
    tokensUsed: number;
    model: string;
    provider: string;
    confidence: number;
  };
}

export interface LLMProvider {
  readonly name: string;
  readonly apiVersion: string;
  
  generateTest(prompt: TestPrompt): Promise<GeneratedTestResult>;
  validateApiKey(apiKey: string): Promise<boolean>;
  estimateTokens(prompt: string): number;
  getSupportedModels(): string[];
}

export interface MCPCommand {
  action: 'navigate' | 'click' | 'fill' | 'screenshot' | 'wait' | 'assert';
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
}
```

**📁 `src/llm-tests/interfaces/test-generation.interface.ts`**
```typescript
export interface TestGenerationRequest {
  targetUrl: string;
  testDescription: string;
  testType: 'e2e' | 'visual' | 'performance' | 'accessibility';
  llmProvider: string;
  model?: string;
  additionalContext?: string;
  userId: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}
```

#### 1.3 Criar Entidades do Banco

**📁 `src/llm-tests/entities/user-api-key.entity.ts`**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_api_keys')
export class UserApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  provider: string; // 'openai', 'anthropic', 'gemini'

  @Column({ type: 'text' })
  encryptedApiKey: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: {
    lastValidated?: Date;
    modelsAccess?: string[];
    monthlyUsage?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**📁 `src/llm-tests/entities/generated-test.entity.ts`**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('generated_tests')
export class GeneratedTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  targetUrl: string;

  @Column()
  testType: string;

  @Column()
  llmProvider: string;

  @Column()
  model: string;

  @Column({ type: 'json' })
  originalPrompt: any;

  @Column({ type: 'json' })
  generatedCode: any;

  @Column({ type: 'json' })
  mcpCommands: any;

  @Column({ type: 'json' })
  validationResult: any;

  @Column({ default: 'draft' })
  status: 'draft' | 'validated' | 'active' | 'failed' | 'archived';

  @Column({ type: 'json', nullable: true })
  executionHistory: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 1.4 Executar Primeira Revisão
```bash
node scripts/llm-tests-review.js infrastructure
```

### 🤖 FASE 2: Provedores LLM (2-3 dias)

#### 2.1 Provider Base Abstrato

**📁 `src/llm-tests/providers/base-llm.provider.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { LLMProvider, TestPrompt, GeneratedTestResult } from '../interfaces/llm-provider.interface';

@Injectable()
export abstract class BaseLLMProvider implements LLMProvider {
  abstract readonly name: string;
  abstract readonly apiVersion: string;

  abstract generateTest(prompt: TestPrompt): Promise<GeneratedTestResult>;
  abstract validateApiKey(apiKey: string): Promise<boolean>;
  abstract getSupportedModels(): string[];

  estimateTokens(prompt: string): number {
    // Estimativa baseada em caracteres (aproximada)
    return Math.ceil(prompt.length / 4);
  }

  protected formatPromptForMCP(prompt: TestPrompt): string {
    return `
${prompt.system}

Contexto do Teste:
${prompt.user}

${prompt.context ? `Contexto Adicional: ${prompt.context}` : ''}

RESPOSTA ESPERADA: JSON válido com a estrutura:
{
  "testCode": "código do teste gerado",
  "mcpCommands": [
    {
      "action": "navigate",
      "url": "URL_DESTINO"
    },
    {
      "action": "click", 
      "selector": "seletor_css"
    }
  ],
  "metadata": {
    "confidence": 85,
    "description": "descrição do teste"
  }
}
    `;
  }

  protected parseResponse(response: string): GeneratedTestResult {
    try {
      const parsed = JSON.parse(response);
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
}
```

#### 2.2 OpenAI Provider

**📁 `src/llm-tests/providers/openai.provider.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { BaseLLMProvider } from './base-llm.provider';
import { TestPrompt, GeneratedTestResult } from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenAIProvider extends BaseLLMProvider {
  readonly name = 'openai';
  readonly apiVersion = 'v1';
  
  private client: OpenAI;

  constructor() {
    super();
  }

  private initializeClient(apiKey: string): void {
    this.client = new OpenAI({ apiKey });
  }

  async generateTest(prompt: TestPrompt, apiKey: string): Promise<GeneratedTestResult> {
    this.initializeClient(apiKey);
    
    const formattedPrompt = this.formatPromptForMCP(prompt);
    
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: formattedPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Resposta vazia do OpenAI');
      }

      return this.parseResponse(response);
    } catch (error) {
      throw new Error(`Erro OpenAI: ${error.message}`);
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      this.initializeClient(apiKey);
      await this.client.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  getSupportedModels(): string[] {
    return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }
}
```

#### 2.3 Factory Pattern

**📁 `src/llm-tests/services/llm-provider.factory.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { OpenAIProvider } from '../providers/openai.provider';
import { AnthropicProvider } from '../providers/anthropic.provider';
import { GeminiProvider } from '../providers/gemini.provider';
import { LLMProvider } from '../interfaces/llm-provider.interface';

@Injectable()
export class LLMProviderFactory {
  constructor(
    private readonly openaiProvider: OpenAIProvider,
    private readonly anthropicProvider: AnthropicProvider,
    private readonly geminiProvider: GeminiProvider,
  ) {}

  createProvider(providerName: string): LLMProvider {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return this.openaiProvider;
      case 'anthropic':
        return this.anthropicProvider;
      case 'gemini':
        return this.geminiProvider;
      default:
        throw new Error(`Provedor LLM não suportado: ${providerName}`);
    }
  }

  getAvailableProviders(): Array<{name: string, models: string[]}> {
    return [
      { name: 'openai', models: this.openaiProvider.getSupportedModels() },
      { name: 'anthropic', models: this.anthropicProvider.getSupportedModels() },
      { name: 'gemini', models: this.geminiProvider.getSupportedModels() }
    ];
  }
}
```

#### 2.4 Executar Segunda Revisão
```bash
node scripts/llm-tests-review.js providers
```

### ⚡ FASE 3: Geração de Testes (3-4 dias)

#### 3.1 Service Principal de Geração

**📁 `src/llm-tests/services/llm-test-generator.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
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
  constructor(
    @InjectRepository(GeneratedTest)
    private generatedTestRepository: Repository<GeneratedTest>,
    private llmProviderFactory: LLMProviderFactory,
    private promptBuilder: TestPromptBuilderService,
    private apiKeyManager: ApiKeyManagerService,
    private testValidator: TestValidatorService,
  ) {}

  async generateTest(request: TestGenerationRequest): Promise<GeneratedTest> {
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

    // 4. Gerar teste usando LLM
    const provider = this.llmProviderFactory.createProvider(request.llmProvider);
    const generatedResult = await provider.generateTest(prompt, apiKey);

    // 5. Validar teste gerado
    const validationResult = await this.testValidator.validateGeneratedTest(
      generatedResult
    );

    // 6. Salvar no banco
    const generatedTest = this.generatedTestRepository.create({
      userId: request.userId,
      name: `Teste ${request.testType} - ${new Date().toISOString()}`,
      description: request.testDescription,
      targetUrl: request.targetUrl,
      testType: request.testType,
      llmProvider: request.llmProvider,
      model: request.model || 'default',
      originalPrompt: prompt,
      generatedCode: generatedResult.testCode,
      mcpCommands: generatedResult.mcpCommands,
      validationResult,
      status: validationResult.isValid ? 'validated' : 'draft'
    });

    return await this.generatedTestRepository.save(generatedTest);
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
  }

  async getGeneratedTests(userId: string): Promise<GeneratedTest[]> {
    return this.generatedTestRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async getTestById(id: string, userId: string): Promise<GeneratedTest> {
    const test = await this.generatedTestRepository.findOne({
      where: { id, userId }
    });

    if (!test) {
      throw new Error('Teste não encontrado');
    }

    return test;
  }
}
```

#### 3.2 Builder de Prompts

**📁 `src/llm-tests/services/test-prompt-builder.service.ts`**
```typescript
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
1. Use APENAS comandos MCP válidos: navigate, click, fill, screenshot, wait, assert
2. Seletores devem ser robustos (prefer data-testid, fallback para CSS específicos)
3. Inclua capturas de tela em pontos críticos do teste
4. Adicione waits apropriados para elementos carregarem
5. Implemente validações para verificar o sucesso das ações
6. Use timeouts adequados para evitar falhas por lentidão
7. Teste deve ser idempotente (pode ser executado múltiplas vezes)
8. Adicione comentários explicativos no código gerado

FORMATO DE RESPOSTA: JSON com estrutura exata:
{
  "testCode": "string - código do teste em formato legível",
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

  private getExamples(testType: string): any[] {
    const examples = {
      'e2e': [
        {
          scenario: 'Login de usuário',
          commands: [
            { action: 'navigate', url: 'https://example.com/login' },
            { action: 'fill', selector: '[data-testid="email"]', value: 'user@example.com' },
            { action: 'fill', selector: '[data-testid="password"]', value: 'password' },
            { action: 'click', selector: '[data-testid="login-button"]' },
            { action: 'wait', selector: '[data-testid="dashboard"]' },
            { action: 'screenshot', name: 'dashboard-logged-in' }
          ]
        }
      ],
      'visual': [
        {
          scenario: 'Comparação visual da homepage',
          commands: [
            { action: 'navigate', url: 'https://example.com' },
            { action: 'wait', timeout: 3000 },
            { action: 'screenshot', name: 'homepage-full', fullPage: true }
          ]
        }
      ]
    };

    return examples[testType] || [];
  }
}
```

#### 3.3 Executar Terceira Revisão
```bash
node scripts/llm-tests-review.js generation
```

### 📊 Script de Monitoramento de Progresso

**📁 `scripts/monitor-progress.js`**
```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

class ProgressMonitor {
  run() {
    console.log('📊 MONITORAMENTO DE PROGRESSO - MÓDULO LLM TESTS');
    console.log('=================================================\n');

    const phases = ['infrastructure', 'providers', 'generation'];
    let totalScore = 0;
    let totalMaxScore = 0;

    phases.forEach(phase => {
      console.log(`🔍 Verificando fase: ${phase}`);
      try {
        const output = execSync(`node scripts/llm-tests-review.js ${phase}`, { encoding: 'utf8' });
        const scoreMatch = output.match(/SCORE: (\d+)\/(\d+)/);
        
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1]);
          const maxScore = parseInt(scoreMatch[2]);
          const percentage = Math.round((score / maxScore) * 100);
          
          totalScore += score;
          totalMaxScore += maxScore;
          
          console.log(`  📈 ${phase}: ${score}/${maxScore} (${percentage}%)`);
        }
      } catch (error) {
        console.log(`  ❌ Erro ao verificar ${phase}`);
      }
    });

    const overallPercentage = Math.round((totalScore / totalMaxScore) * 100);
    console.log(`\n🎯 PROGRESSO GERAL: ${totalScore}/${totalMaxScore} (${overallPercentage}%)`);
    
    if (overallPercentage >= 80) {
      console.log('🎉 Projeto está quase pronto!');
    } else if (overallPercentage >= 60) {
      console.log('👍 Bom progresso, continue!');
    } else {
      console.log('⚠️  Ainda há muito trabalho pela frente.');
    }

    console.log('\n💡 Para revisão detalhada de uma fase específica:');
    console.log('node scripts/llm-tests-review.js [infrastructure|providers|generation]');
  }
}

new ProgressMonitor().run();
```

### 🔧 Comandos Úteis Durante o Desenvolvimento

```bash
# Revisão rápida de progresso
node scripts/monitor-progress.js

# Revisão detalhada por fase
node scripts/llm-tests-review.js infrastructure
node scripts/llm-tests-review.js providers
node scripts/llm-tests-review.js generation

# Teste de compilação TypeScript
npm run build

# Verificar estrutura criada
find src/llm-tests -name "*.ts" | sort

# Contar linhas de código implementadas
find src/llm-tests -name "*.ts" -exec wc -l {} + | tail -1
```

### 📝 Templates de Commits

```bash
# Para fase de infraestrutura
git commit -m "feat: implement LLM tests infrastructure - interfaces and entities"

# Para provedores
git commit -m "feat: implement OpenAI provider for test generation"

# Para geração de testes
git commit -m "feat: implement test generation service with prompt builder"
```

### 🎯 Critérios de Conclusão por Fase

#### Infraestrutura ✅
- [ ] Estrutura de diretórios criada
- [ ] Interfaces principais implementadas  
- [ ] Entidades do banco definidas
- [ ] Módulo principal configurado
- [ ] Score > 80% na revisão

#### Provedores ✅
- [ ] Provider base abstrato implementado
- [ ] Pelo menos 1 provider LLM funcional (OpenAI recomendado)
- [ ] Factory pattern implementado
- [ ] Validação de API keys funcionando
- [ ] Score > 70% na revisão

#### Geração ✅
- [ ] Service de geração implementado
- [ ] Builder de prompts funcional
- [ ] Validação de testes implementada
- [ ] Integração básica com MCP
- [ ] Score > 80% na revisão

### 🚨 Troubleshooting Comum

#### Erro de compilação TypeScript
```bash
# Verificar imports
npm run build 2>&1 | grep -i error

# Limpar cache
rm -rf dist/ && npm run build
```

#### Problemas com API Keys
```bash
# Testar conexão com providers
node -e "console.log(process.env.OPENAI_API_KEY ? 'Key exists' : 'Key missing')"
```

#### Revisão não passa
```bash
# Verificar arquivos ausentes
node scripts/llm-tests-review.js infrastructure --detailed
```

---

**🎉 Após completar todas as fases, você terá um módulo robusto de geração de testes com LLM totalmente funcional!** 