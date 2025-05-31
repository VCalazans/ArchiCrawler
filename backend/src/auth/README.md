# 🔐 Sistema de Autenticação ArchiCrawler

Sistema completo de autenticação para API REST e servidor MCP com múltiplos métodos de autenticação.

## 🚀 Funcionalidades

### 🔑 **Métodos de Autenticação**
- **JWT (JSON Web Tokens)** - Para usuários da API
- **API Keys** - Para integração de sistemas
- **MCP Client Credentials** - Para clientes MCP externos

### 🛡️ **Recursos de Segurança**
- Senhas criptografadas com bcrypt
- Tokens JWT com expiração configurável
- API Keys com hash SHA-256
- Controle de permissões granular
- Validação de IP para clientes MCP
- Rate limiting integrado

## 📋 **Credenciais Padrão**

### Usuário Admin
```
Username: admin
Password: admin123
```

### API Key Padrão
Criada automaticamente no primeiro boot (veja logs do servidor)

### Cliente MCP Padrão
Criado automaticamente no primeiro boot (veja logs do servidor)

## 🔧 **Configuração**

### Variáveis de Ambiente
```bash
# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Servidor
PORT=3001
NODE_ENV=development
```

## 📖 **Guia de Uso**

### 1. **Login e JWT**

```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Resposta
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": "24h",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@archicrawler.com",
    "role": "admin"
  }
}
```

### 2. **Criar API Key**

```bash
# Criar API Key (requer JWT)
curl -X POST http://localhost:3001/auth/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My API Key",
    "permissions": ["mcp:*", "playwright:*"],
    "expiresInDays": 30
  }'

# Resposta
{
  "success": true,
  "apiKey": {
    "id": "abc123",
    "name": "My API Key",
    "key": "ak_1234567890abcdef...",
    "permissions": ["mcp:*", "playwright:*"],
    "expiresAt": "2024-02-15T10:30:00.000Z"
  },
  "warning": "Guarde esta chave com segurança. Ela não será mostrada novamente."
}
```

### 3. **Usar API Key**

```bash
# Método 1: Header X-API-Key
curl -H "X-API-Key: ak_1234567890abcdef..." \
  http://localhost:3001/mcp/servers

# Método 2: Authorization Bearer
curl -H "Authorization: Bearer ak_1234567890abcdef..." \
  http://localhost:3001/mcp/servers

# Método 3: Query Parameter
curl "http://localhost:3001/mcp/servers?api_key=ak_1234567890abcdef..."
```

### 4. **Criar Cliente MCP**

```bash
# Criar Cliente MCP (requer JWT)
curl -X POST http://localhost:3001/auth/mcp-clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My MCP Client",
    "permissions": ["mcp:*", "playwright:*"],
    "allowedIPs": ["127.0.0.1", "192.168.1.100"]
  }'

# Resposta
{
  "success": true,
  "client": {
    "id": "def456",
    "name": "My MCP Client",
    "clientId": "mcp_1234567890abcdef...",
    "clientSecret": "abcdef1234567890...",
    "permissions": ["mcp:*", "playwright:*"],
    "allowedIPs": ["127.0.0.1", "192.168.1.100"]
  },
  "warning": "Guarde estas credenciais com segurança. Elas não serão mostradas novamente."
}
```

### 5. **Usar Cliente MCP**

```bash
# Método 1: Headers separados
curl -X POST http://localhost:3001/mcp/call-tool \
  -H "Content-Type: application/json" \
  -H "X-MCP-Client-ID: mcp_1234567890abcdef..." \
  -H "X-MCP-Client-Secret: abcdef1234567890..." \
  -d '{
    "serverName": "playwright",
    "toolName": "browser_navigate",
    "arguments": {"url": "https://google.com"}
  }'

# Método 2: Basic Auth
curl -X POST http://localhost:3001/mcp/call-tool \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'mcp_client_id:client_secret' | base64)" \
  -d '{
    "serverName": "playwright",
    "toolName": "browser_navigate",
    "arguments": {"url": "https://google.com"}
  }'

# Método 3: Query Parameters
curl -X POST "http://localhost:3001/mcp/call-tool?client_id=mcp_123&client_secret=abc456" \
  -H "Content-Type: application/json" \
  -d '{
    "serverName": "playwright",
    "toolName": "browser_navigate",
    "arguments": {"url": "https://google.com"}
  }'
```

## 🎯 **Sistema de Permissões**

### Formato de Permissões
```
namespace:action
```

### Exemplos
- `*` - Todas as permissões
- `mcp:*` - Todas as ações MCP
- `mcp:call-tool` - Apenas chamar ferramentas MCP
- `playwright:*` - Todas as ações Playwright
- `playwright:navigate` - Apenas navegação Playwright

### Permissões Disponíveis
```
mcp:*                    # Todas as ações MCP
mcp:call-tool           # Chamar ferramentas
mcp:list-tools          # Listar ferramentas
mcp:start-server        # Iniciar servidores
mcp:stop-server         # Parar servidores

playwright:*            # Todas as ações Playwright
playwright:navigate     # Navegação
playwright:click        # Cliques
playwright:fill         # Preenchimento
playwright:screenshot   # Screenshots
playwright:snapshot     # Snapshots

admin:*                 # Ações administrativas
admin:create-users      # Criar usuários
admin:manage-keys       # Gerenciar API keys
admin:manage-clients    # Gerenciar clientes MCP
```

## 🧪 **Testes**

### Executar Testes Completos
```bash
npm run test:auth
```

### Testes Individuais
```bash
# Testar login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Testar API Key
curl -H "X-API-Key: YOUR_API_KEY" \
  http://localhost:3001/auth/test-api-key

# Testar Cliente MCP
curl -H "X-MCP-Client-ID: YOUR_CLIENT_ID" \
     -H "X-MCP-Client-Secret: YOUR_CLIENT_SECRET" \
  http://localhost:3001/auth/test-mcp
```

## 🔒 **Endpoints Protegidos**

### Requer JWT
- `POST /auth/api-keys` - Criar API Key
- `GET /auth/api-keys` - Listar API Keys
- `DELETE /auth/api-keys/:id` - Revogar API Key
- `POST /auth/mcp-clients` - Criar Cliente MCP
- `GET /auth/mcp-clients` - Listar Clientes MCP
- `DELETE /auth/mcp-clients/:id` - Revogar Cliente MCP
- `GET /auth/profile` - Perfil do usuário
- `GET /auth/stats` - Estatísticas

### Requer API Key
- `POST /mcp/servers/:name/start` - Iniciar servidor
- `POST /mcp/servers/:name/stop` - Parar servidor
- `GET /mcp/servers/:name/tools` - Listar ferramentas
- `GET /auth/check-permission` - Verificar permissão

### Requer Cliente MCP
- `POST /mcp/call-tool` - Chamar ferramenta
- `POST /mcp/playwright/*` - Ações Playwright

### Públicos (sem autenticação)
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /mcp/servers` - Listar servidores
- `GET /mcp/connections` - Informações de conexão
- `GET /mcp/servers/:name/status` - Status do servidor

## 🚨 **Segurança**

### Boas Práticas
1. **Altere as credenciais padrão** em produção
2. **Use HTTPS** em produção
3. **Configure JWT_SECRET** forte
4. **Limite IPs** para clientes MCP críticos
5. **Monitore logs** de autenticação
6. **Revogue credenciais** não utilizadas
7. **Use permissões mínimas** necessárias

### Logs de Segurança
O sistema registra automaticamente:
- Tentativas de login
- Uso de API Keys
- Autenticação de clientes MCP
- Falhas de autenticação
- IPs não autorizados

## 🔧 **Troubleshooting**

### Problemas Comuns

**1. Token JWT Expirado**
```
Status: 401
Error: "Token inválido"
```
Solução: Faça login novamente

**2. API Key Inválida**
```
Status: 401
Error: "API Key inválida"
```
Soluções:
- Verifique se a key está correta
- Verifique se não expirou
- Verifique se está ativa

**3. Cliente MCP Negado**
```
Status: 401
Error: "Cliente MCP inválido"
```
Soluções:
- Verifique client_id e client_secret
- Verifique se o IP está permitido
- Verifique se o cliente está ativo

**4. Permissão Negada**
```
Status: 403
Error: "Permissão insuficiente"
```
Solução: Verifique as permissões da API Key ou Cliente MCP

### Debug
```bash
# Verificar status de autenticação
curl http://localhost:3001/auth/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Verificar permissões
curl "http://localhost:3001/auth/check-permission?permission=mcp:call-tool" \
  -H "X-API-Key: YOUR_API_KEY"
```

## 📚 **Integração com Clientes MCP**

### Claude Desktop
```json
{
  "mcpServers": {
    "archicrawler": {
      "command": "curl",
      "args": [
        "-X", "POST",
        "-H", "Content-Type: application/json",
        "-H", "X-MCP-Client-ID: YOUR_CLIENT_ID",
        "-H", "X-MCP-Client-Secret: YOUR_CLIENT_SECRET",
        "http://localhost:3001/mcp/call-tool"
      ]
    }
  }
}
```

### Cursor
```json
{
  "mcp": {
    "servers": {
      "archicrawler": {
        "transport": "http",
        "url": "http://localhost:3001/mcp",
        "auth": {
          "type": "custom",
          "headers": {
            "X-MCP-Client-ID": "YOUR_CLIENT_ID",
            "X-MCP-Client-Secret": "YOUR_CLIENT_SECRET"
          }
        }
      }
    }
  }
}
``` 