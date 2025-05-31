-- Migração 004: Criar tabelas do módulo LLM Tests
-- ================================================================

-- 1. Tabela user_api_keys (Chaves API dos usuários)
CREATE TABLE IF NOT EXISTS user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    encrypted_key TEXT NOT NULL,
    key_alias VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela generated_tests (Testes gerados pelo LLM)
CREATE TABLE IF NOT EXISTS generated_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_url TEXT NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    llm_provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    original_prompt JSON,
    generated_code JSON,
    mcp_commands JSON,
    validation_result JSON,
    status VARCHAR(50) DEFAULT 'draft',
    execution_history JSON,
    last_execution_at TIMESTAMP,
    last_successful_execution_at TIMESTAMP,
    execution_count INTEGER DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela llm_provider_configs (Configurações dos provedores LLM)
CREATE TABLE IF NOT EXISTS llm_provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL UNIQUE,
    config JSON NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela test_execution_results (Resultados de execução dos testes)
CREATE TABLE IF NOT EXISTS test_execution_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'running',
    logs JSON,
    screenshots JSON,
    errors JSON,
    mcp_command_results JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES generated_tests(id) ON DELETE CASCADE
);

-- Índices para performance
-- ================================================================

-- user_api_keys indices
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_provider ON user_api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_active ON user_api_keys(is_active);

-- generated_tests indices
CREATE INDEX IF NOT EXISTS idx_generated_tests_user_id ON generated_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_tests_status ON generated_tests(status);
CREATE INDEX IF NOT EXISTS idx_generated_tests_type ON generated_tests(test_type);
CREATE INDEX IF NOT EXISTS idx_generated_tests_provider ON generated_tests(llm_provider);
CREATE INDEX IF NOT EXISTS idx_generated_tests_created_at ON generated_tests(created_at);

-- test_execution_results indices
CREATE INDEX IF NOT EXISTS idx_test_execution_results_test_id ON test_execution_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_execution_results_user_id ON test_execution_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_execution_results_status ON test_execution_results(status);
CREATE INDEX IF NOT EXISTS idx_test_execution_results_started_at ON test_execution_results(started_at);
CREATE INDEX IF NOT EXISTS idx_test_execution_results_test_user ON test_execution_results(test_id, user_id);

-- llm_provider_configs indices
CREATE INDEX IF NOT EXISTS idx_llm_provider_configs_enabled ON llm_provider_configs(is_enabled);

-- Triggers para auto-update do updated_at
-- ================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
CREATE TRIGGER update_user_api_keys_updated_at BEFORE UPDATE ON user_api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_tests_updated_at BEFORE UPDATE ON generated_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_llm_provider_configs_updated_at BEFORE UPDATE ON llm_provider_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_execution_results_updated_at BEFORE UPDATE ON test_execution_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados iniciais
-- ================================================================

-- Configurações padrão dos provedores LLM
INSERT INTO llm_provider_configs (provider, config, is_enabled) VALUES
('openai', '{
    "name": "OpenAI",
    "models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    "defaultModel": "gpt-4o",
    "apiUrl": "https://api.openai.com/v1",
    "maxTokens": 4000,
    "temperature": 0.1,
    "features": ["json_mode", "function_calling", "vision"]
}', true),

('anthropic', '{
    "name": "Anthropic Claude",
    "models": ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307", "claude-3-opus-20240229"],
    "defaultModel": "claude-3-5-sonnet-20241022",
    "apiUrl": "https://api.anthropic.com/v1",
    "maxTokens": 4000,
    "temperature": 0.1,
    "features": ["vision", "tool_use"]
}', true),

('gemini', '{
    "name": "Google Gemini",
    "models": ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"],
    "defaultModel": "gemini-1.5-pro",
    "apiUrl": "https://generativelanguage.googleapis.com/v1beta",
    "maxTokens": 4000,
    "temperature": 0.1,
    "features": ["function_calling", "vision"]
}', true)

ON CONFLICT (provider) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = CURRENT_TIMESTAMP; 