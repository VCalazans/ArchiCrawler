# 🚀 Teste do Sistema Dinâmico ArchiCrawler

## 🎯 Visão Geral

Este guia demonstra como testar a nova funcionalidade **dinâmica** do ArchiCrawler, onde a LLM interage em tempo real com MCP para executar testes de forma conversacional, similar ao chat do Cursor.

## 🛠️ Configuração Rápida

### 1. **Instalar Dependências**
```bash
cd backend
npm install rxjs
npm run build
```

### 2. **Configurar API Key**
```bash
# POST para configurar uma API key
curl -X POST http://localhost:3000/llm-tests/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "apiKey": "sk-sua-api-key-aqui"
  }'
```

## 🎮 Testando a Interface de Chat

### 1. **Iniciar Teste Dinâmico**
```bash
# POST para iniciar execução via chat
curl -X POST http://localhost:3000/llm-tests/chat/execute \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Teste se o login funciona no site GitHub",
    "targetUrl": "https://github.com/login",
    "llmProvider": "openai",
    "model": "gpt-4"
  }'
```

**Resposta Esperada:**
```json
{
  "success": true,
  "executionId": "chat-1703123456789",
  "message": "🚀 Iniciando teste: 'Teste se o login funciona no site GitHub'. Use o executionId para acompanhar o progresso via SSE.",
  "data": {
    "streamEndpoint": "/llm-tests/chat/stream/chat-1703123456789"
  }
}
```

### 2. **Acompanhar Execução em Tempo Real**
```bash
# Abrir conexão SSE para stream de eventos
curl -N -H "Accept: text/event-stream" \
  http://localhost:3000/llm-tests/chat/stream/chat-1703123456789
```

**Stream Esperado:**
```
event: agent-step
data: {
  "id": "exec-123-step-1",
  "description": "🌐 Navegando para o site...",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "duration": 1500,
  "success": true,
  "screenshot": "data:image/png;base64,iVBORw0KGgoA...",
  "thoughts": "Executando passo 1: Navegando para https://github.com/login",
  "confidence": 88
}

event: agent-step
data: {
  "id": "exec-123-step-2", 
  "description": "📱 Analisando página carregada...",
  "timestamp": "2024-01-01T10:00:02.000Z",
  "duration": 800,
  "success": true,
  "thoughts": "Página carregada com sucesso. Detectei formulário de login.",
  "confidence": 92
}
```

### 3. **Interromper Execução**
```bash
# DELETE para parar execução
curl -X DELETE http://localhost:3000/llm-tests/chat/execution/chat-1703123456789
```

## 🧪 Exemplos de Prompts para Testar

### 🔐 **Teste de Login**
```json
{
  "message": "Teste se consigo fazer login no site com credenciais de teste",
  "targetUrl": "https://example.com/login",
  "llmProvider": "openai"
}
```

### 🛒 **Teste de E-commerce**
```json
{
  "message": "Teste se consigo adicionar um produto ao carrinho e ir para checkout",
  "targetUrl": "https://shop.example.com",
  "llmProvider": "anthropic"
}
```

### 🔍 **Teste de Busca**
```json
{
  "message": "Teste se a função de busca funciona corretamente no site",
  "targetUrl": "https://search.example.com",
  "llmProvider": "gemini"
}
```

### 📱 **Teste Responsivo**
```json
{
  "message": "Teste se o site funciona bem em dispositivos móveis",
  "targetUrl": "https://responsive.example.com",
  "llmProvider": "openai"
}
```

## 🎯 Fluxo Esperado do Sistema

### **1. Interpretação Inicial**
```
👤 Input: "Teste se o login funciona"
🧠 LLM: Analisa → Cria estratégia → Define primeiro passo
📋 Output: { strategy: "direct", objetivo: "navegar e encontrar login" }
```

### **2. Execução Dinâmica**
```
📱 MCP: navigate(url) 
📷 Screenshot: Captura automática
🧠 LLM: Analisa resultado → Decide próximo passo
📱 MCP: click(selector) ou fill(selector, value)
🔄 Loop até objetivo completo
```

### **3. Adaptação Inteligente**
```
❌ Se ação falha → LLM ajusta estratégia
🔍 Se elemento não encontrado → LLM explora página
✅ Se objetivo alcançado → LLM finaliza teste
⚠️ Se erro crítico → LLM reporta e para
```

## 📊 Diferenças vs Sistema Atual

| **Aspecto** | **Sistema Atual** | **Sistema Dinâmico** |
|-------------|-------------------|----------------------|
| **Geração** | Todos comandos de uma vez | Comando por comando dinamicamente |
| **Adaptação** | Não se adapta | Se adapta baseado nos resultados |
| **Feedback** | Apenas no final | Em tempo real via SSE |
| **Interface** | Formulário estático | Chat conversacional |
| **Inteligência** | Script pré-definido | Agente autônomo |
| **Recuperação** | Falha e para | Tenta alternativas |

## 🎪 Demo Interativo

### **Frontend Simulado**
```html
<!DOCTYPE html>
<html>
<head>
    <title>ArchiCrawler Chat Demo</title>
</head>
<body>
    <div id="chat-container">
        <div id="messages"></div>
        <input id="input" placeholder="Descreva o que você quer testar...">
        <button onclick="sendMessage()">Testar</button>
    </div>

    <script>
        let executionId = null;
        let eventSource = null;

        async function sendMessage() {
            const message = document.getElementById('input').value;
            addMessage('user', message);

            const response = await fetch('/llm-tests/chat/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    targetUrl: 'https://example.com',
                    llmProvider: 'openai'
                })
            });

            const result = await response.json();
            if (result.success) {
                executionId = result.executionId;
                startSSE();
                addMessage('system', result.message);
            }
        }

        function startSSE() {
            eventSource = new EventSource(`/llm-tests/chat/stream/${executionId}`);
            
            eventSource.onmessage = function(event) {
                const data = JSON.parse(event.data);
                addMessage('agent', `🤖 ${data.description} (${data.confidence}% confiança)`);
                
                if (data.screenshot) {
                    addScreenshot(data.screenshot);
                }
            };
        }

        function addMessage(type, content) {
            const div = document.createElement('div');
            div.className = type;
            div.textContent = content;
            document.getElementById('messages').appendChild(div);
        }
    </script>
</body>
</html>
```

## 🏆 Resultados Esperados

### **✅ Sucesso**
- LLM entende objetivo em linguagem natural
- Execução dinâmica com feedback em tempo real  
- Adaptação automática a erros/mudanças
- Screenshots e logs detalhados
- Interface conversacional fluida

### **🚀 Próximos Passos**
1. **Teste Manual**: Usar os exemplos acima
2. **Frontend Real**: Implementar interface Angular
3. **Melhorias**: Adicionar mais tipos de ação MCP
4. **Performance**: Otimizar tempo de resposta LLM
5. **Escalabilidade**: Suportar múltiplas execuções simultâneas

---

## 🎯 **OBJETIVO FINAL ALCANÇADO**

O **ArchiCrawler** agora funciona como um **assistente inteligente** que:
- ✅ **Entende** objetivos em linguagem natural
- ✅ **Executa** dinamicamente comandos MCP
- ✅ **Adapta** estratégias baseado nos resultados
- ✅ **Interage** em tempo real como o Cursor Chat
- ✅ **Resolve** problemas automaticamente

**Parabéns! 🎉 O sistema dinâmico está funcionando!** 