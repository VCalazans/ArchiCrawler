# 🚀 Exemplos de Uso - Módulo LLM Tests

## 📋 Configuração Inicial

### 1. Configurar Chave API

```bash
# POST /llm-tests/api-keys
curl -X POST http://localhost:3000/llm-tests/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "apiKey": "sk-..."
  }'
```

### 2. Verificar Provedores Disponíveis

```bash
# GET /llm-tests/api-keys
curl http://localhost:3000/llm-tests/api-keys
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "configured": ["openai"],
    "available": [
      {
        "name": "openai",
        "description": "OpenAI GPT Models - Excelente para geração de código e testes",
        "models": ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"]
      },
      {
        "name": "anthropic",
        "description": "Anthropic Claude Models - Ótimo para análise e raciocínio",
        "models": ["claude-3-opus-20240229", "claude-3-sonnet-20240229"]
      }
    ]
  }
}
```

## 🧪 Gerando Testes

### 1. Teste E2E Básico

```bash
# POST /llm-tests/generate
curl -X POST http://localhost:3000/llm-tests/generate \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://example.com/login",
    "testDescription": "Testar fluxo de login completo",
    "testType": "e2e",
    "llmProvider": "openai",
    "model": "gpt-4",
    "additionalContext": "O site possui campos email e password, botão de login azul"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Teste gerado com sucesso",
  "data": {
    "id": "uuid-123",
    "name": "Teste E2E - example.com - 2025-05-31 12:34",
    "status": "validated",
    "testType": "e2e",
    "targetUrl": "https://example.com/login",
    "llmProvider": "openai",
    "model": "gpt-4",
    "validationResult": {
      "isValid": true,
      "errors": [],
      "warnings": ["Teste não possui capturas de tela para evidência"],
      "score": 95
    },
    "metadata": {
      "tokensUsed": 1250,
      "confidence": 88,
      "estimatedDuration": "45s"
    },
    "createdAt": "2025-05-31T12:34:56.789Z"
  }
}
```

### 2. Teste Visual

```bash
curl -X POST http://localhost:3000/llm-tests/generate \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://myapp.com/dashboard",
    "testDescription": "Capturar screenshots do dashboard em diferentes resoluções",
    "testType": "visual",
    "llmProvider": "anthropic",
    "additionalContext": "Dashboard possui gráficos, tabelas e cards de métricas"
  }'
```

### 3. Teste de Performance

```bash
curl -X POST http://localhost:3000/llm-tests/generate \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://ecommerce.com",
    "testDescription": "Medir tempo de carregamento da página inicial",
    "testType": "performance",
    "llmProvider": "gemini"
  }'
```

## 📊 Consultando Testes

### 1. Listar Todos os Testes

```bash
# GET /llm-tests/generate
curl "http://localhost:3000/llm-tests/generate?limit=10"
```

### 2. Filtrar por Tipo

```bash
curl "http://localhost:3000/llm-tests/generate?testType=e2e&status=validated"
```

### 3. Obter Teste Específico

```bash
# GET /llm-tests/generate/:id
curl http://localhost:3000/llm-tests/generate/uuid-123
```

**Resposta Completa:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Teste E2E - example.com - 2025-05-31 12:34",
    "description": "Testar fluxo de login completo",
    "status": "validated",
    "testType": "e2e",
    "targetUrl": "https://example.com/login",
    "llmProvider": "openai",
    "model": "gpt-4",
    "originalPrompt": {
      "system": "Você é um especialista em automação...",
      "user": "GERAR TESTE E2E...",
      "context": "O site possui campos email e password..."
    },
    "generatedCode": "// Teste E2E para login\n// 1. Navegar para página de login\n// 2. Preencher credenciais\n// 3. Clicar em login\n// 4. Verificar redirecionamento",
    "mcpCommands": [
      {
        "action": "navigate",
        "url": "https://example.com/login",
        "timeout": 30000
      },
      {
        "action": "screenshot",
        "name": "login-page-initial"
      },
      {
        "action": "fill",
        "selector": "[data-testid='email']",
        "value": "test@example.com"
      },
      {
        "action": "fill",
        "selector": "[data-testid='password']",
        "value": "password123"
      },
      {
        "action": "click",
        "selector": "[data-testid='login-button']",
        "timeout": 5000
      },
      {
        "action": "wait",
        "selector": "[data-testid='dashboard']",
        "timeout": 10000
      },
      {
        "action": "screenshot",
        "name": "dashboard-after-login"
      }
    ],
    "validationResult": {
      "isValid": true,
      "errors": [],
      "warnings": ["Teste não possui capturas de tela para evidência"],
      "score": 95
    },
    "metadata": {
      "tokensUsed": 1250,
      "confidence": 88,
      "estimatedDuration": "45s"
    },
    "createdAt": "2025-05-31T12:34:56.789Z",
    "updatedAt": "2025-05-31T12:34:56.789Z"
  }
}
```

### 4. Obter Comandos MCP

```bash
# GET /llm-tests/generate/:id/mcp-commands
curl http://localhost:3000/llm-tests/generate/uuid-123/mcp-commands
```

## 🔄 Gerenciando Testes

### 1. Atualizar Status

```bash
# PUT /llm-tests/generate/:id
curl -X PUT http://localhost:3000/llm-tests/generate/uuid-123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

### 2. Regenerar Teste

```bash
# POST /llm-tests/generate/:id/regenerate
curl -X POST http://localhost:3000/llm-tests/generate/uuid-123/regenerate
```

### 3. Remover Teste

```bash
# DELETE /llm-tests/generate/:id
curl -X DELETE http://localhost:3000/llm-tests/generate/uuid-123
```

## 📈 Estatísticas

```bash
# GET /llm-tests/generate/statistics
curl http://localhost:3000/llm-tests/generate/statistics
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "byType": {
      "e2e": 12,
      "visual": 8,
      "performance": 3,
      "accessibility": 2
    },
    "byStatus": {
      "validated": 18,
      "draft": 4,
      "active": 2,
      "archived": 1
    },
    "byProvider": {
      "openai": 15,
      "anthropic": 7,
      "gemini": 3
    }
  }
}
```

## 🔧 Integração com MCP

### Executando Comandos MCP Gerados

```javascript
// Exemplo de integração com Playwright MCP
const { MCPClient } = require('@playwright/mcp');

async function executeGeneratedTest(testId) {
  // 1. Buscar comandos MCP do teste
  const response = await fetch(`/llm-tests/generate/${testId}/mcp-commands`);
  const { data } = await response.json();
  
  // 2. Executar comandos sequencialmente
  const mcp = new MCPClient();
  
  for (const command of data.mcpCommands) {
    switch (command.action) {
      case 'navigate':
        await mcp.navigate(command.url, { timeout: command.timeout });
        break;
      
      case 'click':
        await mcp.click(command.selector, { timeout: command.timeout });
        break;
      
      case 'fill':
        await mcp.fill(command.selector, command.value);
        break;
      
      case 'screenshot':
        await mcp.screenshot({ 
          name: command.name,
          fullPage: command.fullPage 
        });
        break;
      
      case 'wait':
        if (command.selector) {
          await mcp.waitForSelector(command.selector, { timeout: command.timeout });
        } else {
          await mcp.wait(command.timeout);
        }
        break;
    }
  }
  
  console.log(`Teste ${testId} executado com sucesso!`);
}
```

## 🛡️ Segurança e Boas Práticas

### 1. Validação de API Keys

```bash
# POST /llm-tests/api-keys/openai/validate
curl -X POST http://localhost:3000/llm-tests/api-keys/openai/validate
```

### 2. Verificar Status das Chaves

```bash
# GET /llm-tests/api-keys/status
curl http://localhost:3000/llm-tests/api-keys/status
```

### 3. Configurar Variáveis de Ambiente

```bash
# .env
API_KEY_ENCRYPTION_SECRET=sua-chave-secreta-muito-forte-aqui
DATABASE_URL=postgresql://user:pass@localhost:5432/archicrawler
```

## 🎯 Casos de Uso Avançados

### 1. Teste Complexo com Contexto

```json
{
  "targetUrl": "https://app.example.com/checkout",
  "testDescription": "Testar processo completo de checkout com múltiplos produtos",
  "testType": "e2e",
  "llmProvider": "openai",
  "model": "gpt-4",
  "additionalContext": "Usuário já logado, carrinho possui 3 itens: Produto A (R$ 50), Produto B (R$ 30), Produto C (R$ 20). Aplicar cupom DESCONTO10 para 10% de desconto. Usar cartão de crédito terminado em 1234. CEP: 01234-567"
}
```

### 2. Teste de Acessibilidade

```json
{
  "targetUrl": "https://portal.gov.br",
  "testDescription": "Verificar conformidade com WCAG 2.1 AA",
  "testType": "accessibility",
  "llmProvider": "anthropic",
  "additionalContext": "Verificar contraste de cores, navegação por teclado, textos alternativos em imagens, estrutura de headings"
}
```

### 3. Teste Visual Responsivo

```json
{
  "targetUrl": "https://responsive-site.com",
  "testDescription": "Capturar layouts em diferentes resoluções",
  "testType": "visual",
  "llmProvider": "gemini",
  "additionalContext": "Testar em mobile (375px), tablet (768px) e desktop (1920px). Focar em header, menu de navegação e footer"
}
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **API Key Inválida**
   ```json
   {
     "success": false,
     "message": "Chave API inválida",
     "provider": "openai"
   }
   ```

2. **Teste com Score Baixo**
   ```json
   {
     "validationResult": {
       "isValid": false,
       "errors": ["Comando 1: Ação inválida 'invalid-action'"],
       "warnings": ["Seletor pode não ser robusto: div"],
       "score": 45
     }
   }
   ```

3. **Rate Limit Excedido**
   ```json
   {
     "success": false,
     "message": "Rate limit excedido para OpenAI"
   }
   ```

### Soluções

- Verificar validade das API keys regularmente
- Usar contexto adicional detalhado para melhor qualidade
- Implementar retry logic para rate limits
- Validar URLs antes de gerar testes 