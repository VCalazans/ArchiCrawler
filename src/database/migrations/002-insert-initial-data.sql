-- Inserção de dados iniciais para ArchiCrawler
-- PostgreSQL 17.4

-- Inserir usuário administrador padrão
-- Senha: admin123 (hash bcrypt com salt 10)
INSERT INTO users (id, username, email, password, role, "isActive")
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@archicrawler.com',
    '$2b$10$YQDv0q68dQGUPd.5L2yu/ub.dQCReAHFEuDIOOisGyD5YCTx6Fd5y', -- admin123
    'admin',
    true
) ON CONFLICT (username) DO UPDATE SET 
    password = EXCLUDED.password;

-- Inserir API Key padrão para o admin
-- Chave: ak_default_admin_key_2024_archicrawler_system
-- Hash SHA-256: bdb76e9ce63920640e01fdb87698578a87fd74d0e61a2ad7abe4817e06616b93
INSERT INTO api_keys (id, name, "keyHash", "userId", permissions, "isActive")
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Default Admin API Key',
    'bdb76e9ce63920640e01fdb87698578a87fd74d0e61a2ad7abe4817e06616b93',
    '00000000-0000-0000-0000-000000000001',
    ARRAY['*'],
    true
) ON CONFLICT ("keyHash") DO UPDATE SET 
    "keyHash" = EXCLUDED."keyHash";

-- Inserir cliente MCP padrão
INSERT INTO mcp_clients (id, name, "clientId", "clientSecret", permissions, "isActive", "allowedIPs")
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'ArchiCrawler Default MCP Client',
    'mcp_archicrawler_default_client_2024',
    'archicrawler_mcp_secret_key_2024_default_client_secure',
    ARRAY['mcp:*', 'playwright:*', 'scraper:*'],
    true,
    ARRAY['127.0.0.1', '::1', 'localhost']
) ON CONFLICT ("clientId") DO NOTHING;

-- Inserir usuário de teste
INSERT INTO users (id, username, email, password, role, "isActive")
VALUES (
    '00000000-0000-0000-0000-000000000004',
    'testuser',
    'test@archicrawler.com',
    '$2b$10$YQDv0q68dQGUPd.5L2yu/ub.dQCReAHFEuDIOOisGyD5YCTx6Fd5y', -- admin123
    'user',
    true
) ON CONFLICT (username) DO UPDATE SET 
    password = EXCLUDED.password;

-- Inserir API Key para usuário de teste
-- Chave: ak_test_user_key_2024_archicrawler_limited
-- Hash SHA-256: 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b
INSERT INTO api_keys (id, name, "keyHash", "userId", permissions, "isActive", "expiresAt")
VALUES (
    '00000000-0000-0000-0000-000000000005',
    'Test User API Key',
    '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    '00000000-0000-0000-0000-000000000004',
    ARRAY['scraper:read', 'scraper:execute', 'mcp:read'],
    true,
    CURRENT_TIMESTAMP + INTERVAL '1 year'
) ON CONFLICT ("keyHash") DO NOTHING;

-- Inserir cliente MCP para desenvolvimento
INSERT INTO mcp_clients (id, name, "clientId", "clientSecret", permissions, "isActive", "allowedIPs")
VALUES (
    '00000000-0000-0000-0000-000000000006',
    'Development MCP Client',
    'mcp_dev_client_archicrawler_2024',
    'dev_mcp_secret_archicrawler_2024_development_only',
    ARRAY['mcp:read', 'playwright:navigate', 'playwright:screenshot', 'playwright:click'],
    true,
    ARRAY['127.0.0.1', '::1', 'localhost', '192.168.1.0/24']
) ON CONFLICT ("clientId") DO NOTHING;

-- Verificar dados inseridos
SELECT 
    'users' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_records
FROM users
UNION ALL
SELECT 
    'api_keys' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_records
FROM api_keys
UNION ALL
SELECT 
    'mcp_clients' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_records
FROM mcp_clients;

-- Mostrar credenciais padrão
SELECT 
    '=== CREDENCIAIS PADRÃO CRIADAS ===' as info
UNION ALL
SELECT 'Admin User: admin / admin123' as info
UNION ALL
SELECT 'Test User: testuser / admin123' as info
UNION ALL
SELECT 'Admin API Key: ak_default_admin_key_2024_archicrawler_system' as info
UNION ALL
SELECT 'Test API Key: ak_test_user_key_2024_archicrawler_limited' as info
UNION ALL
SELECT 'Default MCP Client ID: mcp_archicrawler_default_client_2024' as info
UNION ALL
SELECT 'Default MCP Secret: archicrawler_mcp_secret_key_2024_default_client_secure' as info
UNION ALL
SELECT 'Dev MCP Client ID: mcp_dev_client_archicrawler_2024' as info
UNION ALL
SELECT 'Dev MCP Secret: dev_mcp_secret_archicrawler_2024_development_only' as info; 