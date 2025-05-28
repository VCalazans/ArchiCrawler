-- Criação das tabelas de autenticação para ArchiCrawler
-- PostgreSQL 17.4

-- Criar enum para roles de usuário
CREATE TYPE user_role AS ENUM ('admin', 'user', 'mcp-client');

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    "isActive" BOOLEAN DEFAULT true,
    "lastLogin" TIMESTAMP,
    "lastLoginIP" VARCHAR(45),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    "keyHash" VARCHAR(64) UNIQUE NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions TEXT[] DEFAULT '{}',
    "isActive" BOOLEAN DEFAULT true,
    "expiresAt" TIMESTAMP,
    "lastUsed" TIMESTAMP,
    "lastUsedIP" VARCHAR(45),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes MCP
CREATE TABLE IF NOT EXISTS mcp_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    "clientId" VARCHAR(100) UNIQUE NOT NULL,
    "clientSecret" VARCHAR(255) NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    "isActive" BOOLEAN DEFAULT true,
    "allowedIPs" TEXT[] DEFAULT '{}',
    "lastUsed" TIMESTAMP,
    "lastUsedIP" VARCHAR(45),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users("isActive");
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys("keyHash");
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys("userId");
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys("isActive");
CREATE INDEX IF NOT EXISTS idx_mcp_clients_id ON mcp_clients("clientId");
CREATE INDEX IF NOT EXISTS idx_mcp_clients_active ON mcp_clients("isActive");

-- Trigger para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mcp_clients_updated_at BEFORE UPDATE ON mcp_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE users IS 'Tabela de usuários do sistema ArchiCrawler';
COMMENT ON TABLE api_keys IS 'Tabela de chaves de API para autenticação';
COMMENT ON TABLE mcp_clients IS 'Tabela de clientes MCP autorizados';

COMMENT ON COLUMN users.role IS 'Papel do usuário: admin, user ou mcp-client';
COMMENT ON COLUMN api_keys."keyHash" IS 'Hash SHA-256 da chave de API';
COMMENT ON COLUMN api_keys.permissions IS 'Array de permissões no formato namespace:action';
COMMENT ON COLUMN mcp_clients."allowedIPs" IS 'Lista de IPs autorizados para este cliente MCP'; 