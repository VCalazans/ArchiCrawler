# Documentação ArchiCrawler

## 📚 Índice de Documentação

### 🔐 Sistema de Autenticação

1. **[MCP_AUTHENTICATION.md](./MCP_AUTHENTICATION.md)** - Documentação completa do sistema de autenticação MCP
   - Arquitetura de autenticação
   - Especificação técnica
   - Implementação em múltiplas linguagens
   - Segurança e boas práticas

2. **[MCP_AUTHENTICATION_FLOW.md](./MCP_AUTHENTICATION_FLOW.md)** - Fluxo de autenticação MCP (FAQ)
   - Resposta às dúvidas sobre login e sessões
   - Comparação JWT vs MCP
   - Exemplos práticos de implementação
   - Simulação de sessões

## 🚀 Início Rápido

### Para Clientes MCP

**Não precisa fazer login!** Use credenciais diretamente:

```bash
curl -X POST http://localhost:3001/mcp/playwright/navigate \
  -H "X-MCP-Client-ID: mcp_archicrawler_default_client_2024" \
  -H "X-MCP-Client-Secret: archicrawler_mcp_secret_key_2024_default_client_secure" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Para Aplicações Web/Mobile

**Faça login primeiro** para obter JWT:

```bash
# 1. Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# 2. Use o token
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer <token-recebido>"
```

### Para Integrações de Sistema

**Use API Keys** diretamente:

```bash
curl -X POST http://localhost:3001/scraper/extract \
  -H "X-API-Key: ak_default_admin_key_2024_archicrawler_system" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "engine": "playwright"}'
```

## 🔑 Credenciais Padrão

### Usuários (JWT)
- **Admin**: `admin` / `admin123`
- **Test User**: `testuser` / `admin123`

### API Keys
- **Admin**: `ak_default_admin_key_2024_archicrawler_system`
- **Test**: `ak_test_user_key_2024_archicrawler_limited`

### Clientes MCP
- **Default**: 
  - ID: `mcp_archicrawler_default_client_2024`
  - Secret: `archicrawler_mcp_secret_key_2024_default_client_secure`
- **Dev**: 
  - ID: `mcp_dev_client_archicrawler_2024`
  - Secret: `dev_mcp_secret_archicrawler_2024_development_only`

## 🌐 URLs Importantes

- **API Base**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Documentação Swagger**: http://localhost:3001/api

## 📖 Documentação Adicional

- **Swagger/OpenAPI**: Acesse `/api` para documentação interativa completa
- **Postman Collection**: (Em desenvolvimento)
- **SDK Clients**: (Em desenvolvimento)

---

**Última Atualização**: 28/05/2025  
**Versão**: 1.0 