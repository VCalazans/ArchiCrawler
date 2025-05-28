# ArchiCrawler - Gerenciador MCP Genérico

Este módulo fornece uma estrutura genérica para gerenciar múltiplos servidores MCP (Model Context Protocol) no projeto ArchiCrawler.

## 🎯 Características

- **Genérico**: Suporte a qualquer servidor MCP oficial
- **Escalável**: Fácil adição de novos servidores MCP
- **API REST**: Interface HTTP para interação com os servidores
- **Gerenciamento Automático**: Inicialização e finalização automática dos servidores
- **Swagger**: Documentação automática da API

## 📁 Estrutura do Projeto

```
src/mcp/
├── configs/                    # Configurações dos servidores MCP
│   └── playwright-config.json  # Configuração do Playwright MCP
├── mcp-manager.service.ts      # Serviço principal para gerenciar servidores MCP
├── mcp-servers.config.ts       # Configuração dos servidores disponíveis
├── mcp.controller.ts           # Controller REST para API
├── mcp.module.ts              # Módulo NestJS
├── test-mcp.js                # Script de teste
└── README.md                  # Esta documentação
```

## 🚀 Uso Básico

### 1. Iniciar o Servidor NestJS

```bash
npm run start:dev
```

### 2. Acessar a API REST

A API estará disponível em `http://localhost:3001/mcp`

### 3. Documentação Swagger

Acesse `http://localhost:3001/api` para ver a documentação completa da API.

## 📡 Endpoints da API

### Gerenciamento de Servidores

- `GET /mcp/servers` - Listar todos os servidores MCP
- `POST /mcp/servers/{serverName}/start` - Iniciar um servidor específico
- `POST /mcp/servers/{serverName}/stop` - Parar um servidor específico
- `GET /mcp/servers/{serverName}/status` - Status de um servidor
- `GET /mcp/servers/{serverName}/tools` - Listar ferramentas de um servidor

### Execução de Ferramentas

- `POST /mcp/call-tool` - Chamar uma ferramenta de qualquer servidor

### Atalhos para Playwright

- `POST /mcp/playwright/navigate` - Navegar para uma URL
- `POST /mcp/playwright/click` - Clicar em um elemento
- `POST /mcp/playwright/fill` - Preencher um campo
- `GET /mcp/playwright/snapshot` - Obter snapshot da página
- `POST /mcp/playwright/screenshot` - Capturar tela
- `GET /mcp/playwright/tabs` - Listar abas
- `POST /mcp/playwright/close` - Fechar navegador

## 🔧 Configuração de Servidores

### Adicionando um Novo Servidor MCP

Edite o arquivo `src/mcp/mcp-servers.config.ts`:

```typescript
export const MCP_SERVERS_CONFIG: MCPServerConfig[] = [
  {
    name: 'playwright',
    command: 'npx',
    args: ['@playwright/mcp', '--config', 'src/mcp/configs/playwright-config.json'],
    description: 'Servidor MCP oficial do Playwright',
    env: { NODE_ENV: 'production' }
  },
  // Novo servidor
  {
    name: 'filesystem',
    command: 'npx',
    args: ['@modelcontextprotocol/server-filesystem', '/path/to/directory'],
    description: 'Servidor MCP para operações de sistema de arquivos',
    env: { NODE_ENV: 'production' }
  }
];
```

### Exemplos de Servidores MCP Disponíveis

#### 1. Filesystem MCP
```bash
npm install @modelcontextprotocol/server-filesystem
```

```typescript
{
  name: 'filesystem',
  command: 'npx',
  args: ['@modelcontextprotocol/server-filesystem', '/allowed/directory'],
  description: 'Operações de sistema de arquivos',
  env: { NODE_ENV: 'production' }
}
```

#### 2. SQLite MCP
```bash
npm install @modelcontextprotocol/server-sqlite
```

```typescript
{
  name: 'sqlite',
  command: 'npx',
  args: ['@modelcontextprotocol/server-sqlite', '--db-path', './database.sqlite'],
  description: 'Operações com banco de dados SQLite',
  env: { NODE_ENV: 'production' }
}
```

#### 3. GitHub MCP
```bash
npm install @modelcontextprotocol/server-github
```

```typescript
{
  name: 'github',
  command: 'npx',
  args: ['@modelcontextprotocol/server-github'],
  description: 'Integração com GitHub',
  env: {
    NODE_ENV: 'production',
    GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || ''
  }
}
```

## 🧪 Testes

### Testar Servidor MCP Standalone

```bash
npm run test:mcp
```

### Testar API REST

```bash
# Iniciar o servidor
npm run start:dev

# Em outro terminal, testar endpoints
curl http://localhost:3001/mcp/servers
```

## 📝 Exemplos de Uso da API

### Listar Servidores Disponíveis

```bash
curl -X GET http://localhost:3001/mcp/servers
```

### Iniciar um Servidor

```bash
curl -X POST http://localhost:3001/mcp/servers/playwright/start
```

### Listar Ferramentas de um Servidor

```bash
curl -X GET http://localhost:3001/mcp/servers/playwright/tools
```

### Chamar uma Ferramenta

```bash
curl -X POST http://localhost:3001/mcp/call-tool \
  -H "Content-Type: application/json" \
  -d '{
    "serverName": "playwright",
    "toolName": "browser_navigate",
    "arguments": {
      "url": "https://example.com"
    }
  }'
```

### Navegar com Playwright (Atalho)

```bash
curl -X POST http://localhost:3001/mcp/playwright/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 🔧 Scripts NPM

- `npm run start:dev` - Iniciar servidor NestJS em modo desenvolvimento
- `npm run mcp:playwright` - Executar servidor Playwright MCP standalone
- `npm run test:mcp` - Testar servidor MCP

## 🌟 Recursos do Playwright MCP

O servidor Playwright MCP oficial oferece:

- **Navegação**: Navegar para URLs, voltar, avançar
- **Interação**: Clicar, preencher, selecionar, arrastar
- **Captura**: Screenshots, PDFs, snapshots estruturados
- **Dados**: Texto da página, HTML, requisições de rede
- **Abas**: Gerenciamento de múltiplas abas
- **Console**: Captura de mensagens do console
- **Vision**: Interação por coordenadas visuais
- **Upload**: Upload de arquivos
- **Testes**: Geração automática de testes Playwright

## 🔒 Configuração de Segurança

O arquivo `src/mcp/configs/playwright-config.json` permite configurar:

- Domínios permitidos
- Permissões de upload/download
- Timeouts
- Recursos habilitados
- Configurações de segurança

## 🚀 Próximos Passos

1. **Adicionar mais servidores MCP** conforme necessário
2. **Configurar autenticação** para APIs sensíveis
3. **Implementar cache** para melhor performance
4. **Adicionar logs estruturados** para monitoramento
5. **Criar testes automatizados** para cada servidor MCP

## 📚 Recursos Adicionais

- [Documentação oficial do MCP](https://modelcontextprotocol.io/)
- [Playwright MCP no GitHub](https://github.com/microsoft/playwright-mcp)
- [Lista de servidores MCP oficiais](https://github.com/modelcontextprotocol)

---

**Nota**: Esta implementação foca apenas em servidores MCP oficiais para garantir estabilidade e compatibilidade máxima. 