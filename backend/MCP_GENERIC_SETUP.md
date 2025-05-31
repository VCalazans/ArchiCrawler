# ArchiCrawler - Implementação Genérica de MCP

## 🎯 Resumo da Implementação

O projeto ArchiCrawler agora possui uma **estrutura genérica para gerenciar múltiplos servidores MCP** (Model Context Protocol), focando exclusivamente em servidores oficiais para máxima estabilidade e compatibilidade.

## 📁 Estrutura Final

```
src/mcp/
├── configs/
│   └── playwright-config.json      # Configuração do Playwright MCP
├── mcp-manager.service.ts          # Serviço principal (genérico)
├── mcp-servers.config.ts           # Configuração dos servidores
├── mcp.controller.ts               # Controller REST (genérico)
├── mcp.module.ts                   # Módulo NestJS
├── test-mcp.js                     # Script de teste
└── README.md                       # Documentação completa
```

## 🚀 Características Principais

### ✅ Genérico e Escalável
- Suporte a **qualquer servidor MCP oficial**
- Fácil adição de novos servidores via configuração
- Gerenciamento automático de processos

### ✅ API REST Completa
- Endpoints para gerenciar servidores
- Execução de ferramentas via HTTP
- Documentação Swagger automática
- Atalhos específicos para Playwright

### ✅ Integração NestJS
- Módulo totalmente integrado
- Inicialização automática
- Logs estruturados
- Cleanup automático de recursos

## 🔧 Como Usar

### 1. Iniciar o Servidor
```bash
npm run start:dev
```

### 2. Acessar APIs
- **API REST**: `http://localhost:3001/mcp`
- **Swagger**: `http://localhost:3001/api`

### 3. Testar MCP Standalone
```bash
npm run test:mcp
```

## 📡 Endpoints Principais

### Gerenciamento
- `GET /mcp/servers` - Listar servidores
- `POST /mcp/servers/{name}/start` - Iniciar servidor
- `POST /mcp/servers/{name}/stop` - Parar servidor
- `GET /mcp/servers/{name}/tools` - Listar ferramentas

### Execução
- `POST /mcp/call-tool` - Executar ferramenta genérica

### Atalhos Playwright
- `POST /mcp/playwright/navigate` - Navegar
- `POST /mcp/playwright/click` - Clicar
- `POST /mcp/playwright/screenshot` - Screenshot
- `GET /mcp/playwright/snapshot` - Snapshot

## 🔧 Adicionando Novos Servidores MCP

### 1. Instalar o Servidor
```bash
npm install @modelcontextprotocol/server-filesystem
```

### 2. Configurar em `mcp-servers.config.ts`
```typescript
{
  name: 'filesystem',
  command: 'npx',
  args: ['@modelcontextprotocol/server-filesystem', '/allowed/path'],
  description: 'Operações de sistema de arquivos',
  env: { NODE_ENV: 'production' }
}
```

### 3. Usar via API
```bash
curl -X POST http://localhost:3001/mcp/servers/filesystem/start
curl -X GET http://localhost:3001/mcp/servers/filesystem/tools
```

## 🌟 Servidores MCP Sugeridos

### 1. Filesystem
```bash
npm install @modelcontextprotocol/server-filesystem
```
- **Função**: Operações de arquivos e diretórios
- **Uso**: Leitura, escrita, listagem de arquivos

### 2. SQLite
```bash
npm install @modelcontextprotocol/server-sqlite
```
- **Função**: Operações com banco SQLite
- **Uso**: Consultas, inserções, atualizações

### 3. GitHub
```bash
npm install @modelcontextprotocol/server-github
```
- **Função**: Integração com GitHub
- **Uso**: Repositórios, issues, pull requests

### 4. Brave Search
```bash
npm install @modelcontextprotocol/server-brave-search
```
- **Função**: Busca na web
- **Uso**: Pesquisas em tempo real

## 📊 Recursos do Playwright MCP

### Navegação
- `browser_navigate` - Navegar para URL
- `browser_go_back` - Voltar página
- `browser_go_forward` - Avançar página

### Interação
- `browser_click` - Clicar em elementos
- `browser_fill` - Preencher campos
- `browser_hover` - Hover sobre elementos

### Captura
- `browser_take_screenshot` - Screenshots
- `browser_pdf_save` - Salvar como PDF
- `browser_snapshot` - Snapshot estruturado

### Dados
- `browser_network_requests` - Requisições HTTP
- `browser_console_messages` - Mensagens do console

### Abas
- `browser_tab_list` - Listar abas
- `browser_tab_new` - Nova aba
- `browser_tab_select` - Selecionar aba

### Avançado
- `browser_file_upload` - Upload de arquivos
- `browser_handle_dialog` - Diálogos
- `browser_generate_playwright_test` - Gerar testes

## 🔒 Configuração de Segurança

### Playwright Config (`configs/playwright-config.json`)
```json
{
  "permissions": {
    "allowedDomains": ["*"],
    "allowFileUploads": true,
    "maxFileSize": "10MB"
  },
  "security": {
    "allowJavaScript": true,
    "allowPopups": false,
    "allowGeolocation": false
  }
}
```

## 🧪 Scripts Disponíveis

```json
{
  "start:dev": "nest start --watch",
  "mcp:playwright": "npx @playwright/mcp --config src/mcp/configs/playwright-config.json",
  "test:mcp": "node src/mcp/test-mcp.js"
}
```

## 📝 Exemplo de Uso Completo

### 1. Listar Servidores
```bash
curl http://localhost:3001/mcp/servers
```

### 2. Iniciar Playwright
```bash
curl -X POST http://localhost:3001/mcp/servers/playwright/start
```

### 3. Navegar para Site
```bash
curl -X POST http://localhost:3001/mcp/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "serverName": "playwright",
    "toolName": "browser_navigate",
    "arguments": {"url": "https://example.com"}
  }'
```

### 4. Capturar Screenshot
```bash
curl -X POST http://localhost:3001/mcp/playwright/screenshot \
  -H "Content-Type: application/json" \
  -d '{"filename": "example.png"}'
```

## 🚀 Próximos Passos

1. **Adicionar autenticação** para APIs sensíveis
2. **Implementar rate limiting** por servidor
3. **Adicionar métricas** de uso
4. **Criar testes automatizados** para cada servidor
5. **Implementar cache** para melhor performance

## 📚 Recursos

- [Documentação MCP](https://modelcontextprotocol.io/)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Servidores MCP Oficiais](https://github.com/modelcontextprotocol)

---

## ✅ Status da Implementação

- ✅ **Estrutura genérica** implementada
- ✅ **Playwright MCP oficial** integrado
- ✅ **API REST completa** funcionando
- ✅ **Documentação Swagger** disponível
- ✅ **Testes** funcionais
- ✅ **Compilação** sem erros
- ✅ **Módulo NestJS** integrado
- ✅ **Configuração flexível** implementada

**O ArchiCrawler agora possui uma base sólida e escalável para trabalhar com qualquer servidor MCP oficial!** 