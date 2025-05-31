-- =====================================================
-- Migração 004: Criação das Tabelas do Módulo LLM Tests
-- =====================================================

-- 1. Tabela para armazenar chaves API dos usuários (criptografadas)
CREATE TABLE IF NOT EXISTS user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('openai', 'anthropic', 'gemini')),
    "encryptedApiKey" TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint único
    UNIQUE("userId", provider)
);

-- Índices para user_api_keys
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys ("userId");
CREATE INDEX IF NOT EXISTS idx_user_api_keys_provider ON user_api_keys (provider);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_active ON user_api_keys ("isActive");

-- 2. Tabela para armazenar testes gerados
CREATE TABLE IF NOT EXISTS generated_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR(255) NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    "targetUrl" VARCHAR(2000) NOT NULL,
    "testType" VARCHAR(50) NOT NULL CHECK ("testType" IN ('e2e', 'visual', 'performance', 'accessibility')),
    "llmProvider" VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    "originalPrompt" JSONB NOT NULL,
    "generatedCode" JSONB NOT NULL,
    "mcpCommands" JSONB NOT NULL,
    "validationResult" JSONB DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'active', 'failed', 'archived')),
    "executionHistory" JSONB DEFAULT NULL,
    metadata JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para generated_tests
CREATE INDEX IF NOT EXISTS idx_generated_tests_user_id ON generated_tests ("userId");
CREATE INDEX IF NOT EXISTS idx_generated_tests_type ON generated_tests ("testType");
CREATE INDEX IF NOT EXISTS idx_generated_tests_provider ON generated_tests ("llmProvider");
CREATE INDEX IF NOT EXISTS idx_generated_tests_status ON generated_tests (status);
CREATE INDEX IF NOT EXISTS idx_generated_tests_created ON generated_tests ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_generated_tests_url ON generated_tests ("targetUrl");

-- 3. Tabela para configurações dos provedores LLM
CREATE TABLE IF NOT EXISTS llm_provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    "supportedModels" JSONB NOT NULL DEFAULT '[]',
    "defaultSettings" JSONB DEFAULT '{}',
    pricing JSONB DEFAULT '{}',
    "isActive" BOOLEAN DEFAULT true,
    "apiVersion" VARCHAR(50) DEFAULT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para llm_provider_configs
CREATE INDEX IF NOT EXISTS idx_llm_provider_configs_provider ON llm_provider_configs (provider);
CREATE INDEX IF NOT EXISTS idx_llm_provider_configs_active ON llm_provider_configs ("isActive");

-- =====================================================
-- Inserir configurações iniciais dos provedores
-- =====================================================

INSERT INTO llm_provider_configs (provider, name, description, "supportedModels", "defaultSettings", pricing, "isActive", "apiVersion") 
VALUES 
-- OpenAI Configuration
('openai', 'OpenAI GPT Models', 'OpenAI GPT Models - Excelente para geração de código e testes', 
 '["gpt-4", "gpt-4-turbo", "gpt-4-turbo-preview", "gpt-3.5-turbo", "gpt-3.5-turbo-16k"]',
 '{"temperature": 0.1, "maxTokens": 2000, "timeout": 30000}',
 '{"inputTokenCost": 0.03, "outputTokenCost": 0.06, "currency": "USD"}',
 true, 'v1'),

-- Anthropic Configuration  
('anthropic', 'Anthropic Claude Models', 'Anthropic Claude Models - Ótimo para análise e raciocínio',
 '["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307", "claude-2.1", "claude-2.0"]',
 '{"temperature": 0.1, "maxTokens": 2000, "timeout": 30000}',
 '{"inputTokenCost": 0.015, "outputTokenCost": 0.075, "currency": "USD"}',
 true, 'v1'),

-- Gemini Configuration
('gemini', 'Google Gemini Models', 'Google Gemini Models - Versátil e eficiente',
 '["gemini-pro", "gemini-pro-vision", "gemini-1.5-pro", "gemini-1.5-flash"]',
 '{"temperature": 0.1, "maxTokens": 2000, "timeout": 30000}',
 '{"inputTokenCost": 0.001, "outputTokenCost": 0.002, "currency": "USD"}',
 true, 'v1')

ON CONFLICT (provider) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    "supportedModels" = EXCLUDED."supportedModels",
    "defaultSettings" = EXCLUDED."defaultSettings",
    pricing = EXCLUDED.pricing,
    "isActive" = EXCLUDED."isActive",
    "apiVersion" = EXCLUDED."apiVersion",
    "updatedAt" = NOW();

-- =====================================================
-- Função para atualizar timestamp automaticamente
-- =====================================================

-- Função para atualizar updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática de updatedAt
CREATE TRIGGER update_user_api_keys_updated_at 
    BEFORE UPDATE ON user_api_keys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_tests_updated_at 
    BEFORE UPDATE ON generated_tests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_llm_provider_configs_updated_at 
    BEFORE UPDATE ON llm_provider_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comentários das tabelas
-- =====================================================

COMMENT ON TABLE user_api_keys IS 'Armazena chaves API dos usuários para provedores LLM (criptografadas)';
COMMENT ON COLUMN user_api_keys."encryptedApiKey" IS 'Chave API criptografada usando AES-256';
COMMENT ON COLUMN user_api_keys.metadata IS 'Metadados como última validação, modelos disponíveis, uso mensal';

COMMENT ON TABLE generated_tests IS 'Histórico completo de testes gerados usando LLMs';
COMMENT ON COLUMN generated_tests."originalPrompt" IS 'Prompt original enviado para o LLM';
COMMENT ON COLUMN generated_tests."generatedCode" IS 'Código do teste gerado pelo LLM';
COMMENT ON COLUMN generated_tests."mcpCommands" IS 'Comandos MCP estruturados para execução';
COMMENT ON COLUMN generated_tests."validationResult" IS 'Resultado da validação automática do teste';

COMMENT ON TABLE llm_provider_configs IS 'Configurações e capacidades dos provedores LLM disponíveis';

-- =====================================================
-- Relatório final
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migração 004 - Módulo LLM Tests concluída com sucesso!';
    RAISE NOTICE '📊 Tabelas criadas:';
    RAISE NOTICE '   • user_api_keys - Gerenciamento seguro de API keys';
    RAISE NOTICE '   • generated_tests - Histórico de testes gerados';
    RAISE NOTICE '   • llm_provider_configs - Configurações dos provedores';
    RAISE NOTICE '🔧 Recursos implementados:';
    RAISE NOTICE '   • Criptografia de chaves API';
    RAISE NOTICE '   • Suporte a múltiplos provedores LLM';
    RAISE NOTICE '   • Histórico completo de gerações';
    RAISE NOTICE '   • Validação automática de testes';
    RAISE NOTICE '   • Comandos MCP estruturados';
END $$; 