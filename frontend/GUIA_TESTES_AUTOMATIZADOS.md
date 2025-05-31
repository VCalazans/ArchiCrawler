# 🚀 Guia Completo - Centro de Testes Automatizados

## 📍 Como Acessar

### 1. **Navegação**
1. Faça login na aplicação
2. No menu lateral, clique em **"Test Flows"** ou **"Fluxos de Teste"**
3. Você será redirecionado para: `/test-flows`

### 2. **Interface Principal**
A página contém **4 abas principais**:

- **🔍 Fluxos Salvos** - Gerenciar testes salvos
- **🔧 Criador de Testes** - Criar testes visuais drag-and-drop  
- **📸 Testes Visuais** - Comparação de screenshots
- **⚡ Monitor Performance** - Métricas de velocidade

---

## 🔧 **ABA 1: Criador de Testes Automatizados**

### **Funcionalidades Disponíveis:**
- ✅ **7 Tipos de Ações:** Navigate, Click, Fill, Screenshot, Assert, Extract, Wait
- ✅ **Execução Sequencial** com feedback visual
- ✅ **Configuração de Ambientes** (dev/staging/prod)
- ✅ **Integração MCP Playwright** do backend

### **Como Usar:**

#### **Passo 1: Configurar Suite**
```
Nome da Suite: "Teste Login E-commerce"
Ambiente: Desenvolvimento
```

#### **Passo 2: Adicionar Passos**
1. **Clique em "Adicionar Passo"**
2. **Escolha o tipo:**
   - 🌐 **Navigate:** `https://exemplo.com/login`
   - ✏️ **Fill:** `#email` → `teste@exemplo.com`
   - ✏️ **Fill:** `#password` → `senha123`
   - 👆 **Click:** `#btn-login`
   - ✅ **Assert:** `.welcome-message` (validar login)
   - 📸 **Screenshot:** Capturar resultado

#### **Passo 3: Executar**
- Clique em **"Executar Suite"**
- Acompanhe o progresso em tempo real
- Veja resultados de cada passo

### **APIs Utilizadas:**
```javascript
// Navegação
POST /api/mcp/playwright/navigate
{ "url": "https://exemplo.com" }

// Clique
POST /api/mcp/playwright/click  
{ "element": "#botao-login" }

// Preenchimento
POST /api/mcp/playwright/fill
{ "element": "#email", "text": "teste@email.com" }

// Screenshot
POST /api/mcp/playwright/screenshot
{ "filename": "resultado-teste" }

// Extração de dados
POST /api/scraper/extract
{ "url": "...", "selectors": {...} }
```

---

## 📸 **ABA 2: Testes de Regressão Visual**

### **Funcionalidades:**
- ✅ **Criação de Baselines** automática
- ✅ **Comparação de Screenshots** 
- ✅ **Threshold configurável** (50-100%)
- ✅ **Preview lado a lado**

### **Como Usar:**

#### **Passo 1: Criar Baseline**
```
Nome: "Homepage Principal"
URL: https://meusite.com
Threshold: 95%
```
→ Clique **"Criar Baseline"**

#### **Passo 2: Executar Comparações**
- **Teste Individual:** Botão "Comparar" no card
- **Todos os Testes:** Botão "Executar Todos os Testes"

#### **Passo 3: Analisar Resultados**
- **Verde:** Passou (≥ threshold)
- **Vermelho:** Falhou (< threshold)  
- **Amarelo:** Executando
- **Botão "Ver Imagens":** Comparação visual

### **APIs Utilizadas:**
```javascript
// Captura de screenshot para baseline/comparação
POST /api/scraper/screenshot
{
  "url": "https://exemplo.com",
  "fullPage": true,
  "format": "png",
  "quality": 100,
  "device": "desktop"
}
```

---

## ⚡ **ABA 3: Monitor de Performance**

### **Métricas Coletadas:**
- 🚀 **Load Time** - Tempo total de carregamento
- 🎯 **LCP** - Largest Contentful Paint
- 📐 **CLS** - Cumulative Layout Shift  
- ⚡ **FID** - First Input Delay
- 📊 **Network Requests** - Número de requisições
- 💾 **Total Size** - Tamanho total dos recursos

### **Como Usar:**

#### **Passo 1: Criar Teste**
```
Nome: "Performance Homepage"
URL: https://meusite.com  
Intervalo: 30 minutos
```

#### **Passo 2: Configurar Thresholds**
- Load Time: 3000ms
- LCP: 2500ms
- CLS: 0.1
- FID: 100ms

#### **Passo 3: Monitorar**
- **"Testar Agora":** Execução manual
- **"Iniciar":** Monitoramento automático
- **"Ver Histórico":** Tabela com últimas 20 execuções

### **APIs Utilizadas:**
```javascript
// Coleta de métricas de performance
POST /api/scraper/extract
{
  "url": "https://exemplo.com",
  "performanceMetrics": true,
  "engine": "playwright",
  "options": {
    "waitUntil": "networkidle",
    "timeout": 30000
  }
}
```

---

## 🔍 **ABA 4: Fluxos Salvos**

### **Funcionalidades:**
- ✅ **Gestão de Fluxos** salvos
- ✅ **Status Management** (ativo/rascunho/pausado)
- ✅ **Execução Programada**
- ✅ **Histórico de Execuções**

### **Como Usar:**

#### **Criar Novo Fluxo:**
1. Clique **"Novo Fluxo"**
2. Preencha:
   - Nome: "Fluxo Checkout E-commerce"
   - Descrição: "Testa processo completo de compra"
   - Status: Ativo/Rascunho

#### **Gerenciar Fluxos:**
- **▶️ Play:** Executar fluxo
- **✏️ Edit:** Editar configurações  
- **🗑️ Delete:** Remover fluxo

---

## 🧪 **Exemplos Práticos de Testes**

### **1. Teste de Login Completo**
```javascript
Suite: "Autenticação de Usuário"
Passos:
1. Navigate → https://app.exemplo.com/login
2. Fill → #email → usuario@teste.com
3. Fill → #password → minhasenha123
4. Click → #btn-entrar
5. Assert → .dashboard-header (confirmar login)
6. Screenshot → resultado-login
```

### **2. Teste de Formulário de Contato**
```javascript
Suite: "Formulário de Contato"
Passos:
1. Navigate → https://site.com/contato
2. Fill → #nome → João Silva
3. Fill → #email → joao@email.com
4. Fill → #mensagem → Mensagem de teste
5. Click → #enviar
6. Assert → .sucesso-mensagem
7. Screenshot → formulario-enviado
```

### **3. Teste de Performance E-commerce**
```javascript
Teste Performance: "Página de Produto"
URL: https://loja.com/produto/123
Métricas:
- Load Time: < 2s
- LCP: < 1.8s
- CLS: < 0.1
- Total Size: < 2MB
```

### **4. Teste Visual de Layout**
```javascript
Teste Visual: "Header Responsivo"
URLs:
- Desktop: https://site.com (1920x1080)
- Mobile: https://site.com (375x667)
Threshold: 98%
```

---

## 🔧 **Configuração do Backend**

### **Pré-requisitos:**
1. **Servidor MCP Playwright** deve estar rodando
2. **API Keys** configuradas
3. **Scraper Service** ativo

### **Verificar Status:**
```bash
# Verificar servidores MCP
GET /api/mcp/servers

# Iniciar Playwright
POST /api/mcp/servers/playwright/start
Headers: X-API-Key: sua-api-key

# Verificar status
GET /api/mcp/servers/playwright/status
```

### **Autenticação MCP:**
```javascript
Headers:
- X-MCP-Client-ID: automated-test-suite
- X-MCP-Client-Secret: test-secret
```

---

## 📊 **Relatórios e Métricas**

### **Dashboard de Resultados:**
- ✅ **Taxa de Sucesso** dos testes
- 📈 **Trends de Performance** ao longo do tempo
- 🚨 **Alertas** para falhas/regressões
- 📸 **Galeria de Screenshots** comparativos

### **Exportação:**
- 📄 **PDF Reports** com métricas
- 📊 **CSV/Excel** para análise
- 🔗 **Links Compartilháveis** de resultados

---

## 🚀 **Próximos Passos**

### **Integrações Futuras:**
1. **CI/CD Pipeline Integration**
2. **Slack/Teams Notifications** 
3. **Webhook Alerts**
4. **API Testing Module**
5. **A/B Testing Support**

### **Melhorias Planejadas:**
1. **Drag & Drop Test Builder**
2. **AI-Powered Test Generation**
3. **Cross-Browser Testing**
4. **Mobile Device Emulation**
5. **Accessibility Testing**

---

## 🆘 **Troubleshooting**

### **Problemas Comuns:**

#### **1. "Falha ao iniciar servidor Playwright"**
```bash
# Verificar se o servidor está rodando
curl -X POST localhost:3000/api/mcp/servers/playwright/start \
  -H "X-API-Key: sua-key"
```

#### **2. "Seletor não encontrado"**
- Verificar se o elemento existe na página
- Usar DevTools para confirmar o seletor CSS
- Adicionar wait antes do clique/preenchimento

#### **3. "Screenshots diferentes (falso positivo)"**
- Ajustar threshold para menor sensibilidade
- Verificar se não há elementos dinâmicos (datas, ads)
- Usar seletores mais específicos

#### **4. "Performance inconsistente"**
- Executar múltiplos testes para média
- Verificar condições de rede
- Configurar timeouts adequados

---

**🎯 O Centro de Testes Automatizados está pronto para uso! Experimente cada funcionalidade e maximize a qualidade dos seus projetos web.** 