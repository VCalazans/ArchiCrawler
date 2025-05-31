-- Migration: 003-create-test-flows-tables.sql
-- Descrição: Criar tabelas para gerenciamento de fluxos de teste e execuções

-- Criar enum para status de TestFlow
CREATE TYPE test_flow_status AS ENUM ('draft', 'active', 'paused', 'archived');

-- Criar enum para status de TestExecution
CREATE TYPE test_execution_status AS ENUM ('pending', 'running', 'success', 'failed', 'cancelled');

-- Criar tabela test_flows
CREATE TABLE IF NOT EXISTS test_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL DEFAULT '[]',
    user_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    status test_flow_status DEFAULT 'draft',
    last_run TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_test_flows_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Criar tabela test_executions
CREATE TABLE IF NOT EXISTS test_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_flow_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status test_execution_status DEFAULT 'pending',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration INTEGER, -- duração em milissegundos
    error TEXT,
    result JSONB,
    steps JSONB, -- detalhes da execução de cada passo
    total_steps INTEGER DEFAULT 0,
    completed_steps INTEGER DEFAULT 0,
    failed_steps INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_test_executions_test_flow_id 
        FOREIGN KEY (test_flow_id) 
        REFERENCES test_flows(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_test_executions_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_test_flows_user_id ON test_flows(user_id);
CREATE INDEX IF NOT EXISTS idx_test_flows_status ON test_flows(status);
CREATE INDEX IF NOT EXISTS idx_test_flows_is_active ON test_flows(is_active);
CREATE INDEX IF NOT EXISTS idx_test_flows_created_at ON test_flows(created_at);
CREATE INDEX IF NOT EXISTS idx_test_flows_updated_at ON test_flows(updated_at);

CREATE INDEX IF NOT EXISTS idx_test_executions_test_flow_id ON test_executions(test_flow_id);
CREATE INDEX IF NOT EXISTS idx_test_executions_user_id ON test_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_executions_status ON test_executions(status);
CREATE INDEX IF NOT EXISTS idx_test_executions_created_at ON test_executions(created_at);
CREATE INDEX IF NOT EXISTS idx_test_executions_start_time ON test_executions(start_time);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_test_flows_updated_at 
    BEFORE UPDATE ON test_flows 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_executions_updated_at 
    BEFORE UPDATE ON test_executions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo (opcional)
INSERT INTO test_flows (name, description, steps, user_id, status, is_active) 
SELECT 
    'Exemplo: Teste de Login',
    'Fluxo de exemplo para testar funcionalidade de login em um site',
    '[
        {
            "id": "step-1",
            "type": "navigate",
            "name": "Navegar para página de login",
            "description": "Acessar a página principal do site",
            "config": {
                "url": "https://example.com/login"
            },
            "timeout": 5000
        },
        {
            "id": "step-2", 
            "type": "fill",
            "name": "Preencher email",
            "description": "Inserir email no campo de login",
            "config": {
                "selector": "input[name=\"email\"]",
                "value": "test@example.com"
            }
        },
        {
            "id": "step-3",
            "type": "fill", 
            "name": "Preencher senha",
            "description": "Inserir senha no campo correspondente",
            "config": {
                "selector": "input[name=\"password\"]",
                "value": "password123"
            }
        },
        {
            "id": "step-4",
            "type": "click",
            "name": "Clicar em entrar",
            "description": "Submeter o formulário de login",
            "config": {
                "selector": "button[type=\"submit\"]"
            }
        },
        {
            "id": "step-5",
            "type": "screenshot",
            "name": "Screenshot da dashboard",
            "description": "Capturar tela após login bem-sucedido",
            "config": {
                "name": "dashboard-after-login",
                "fullPage": true
            }
        }
    ]'::jsonb,
    u.id,
    'draft',
    true
FROM users u 
WHERE u.username = 'admin'
LIMIT 1;

-- Comentários sobre as tabelas criadas
COMMENT ON TABLE test_flows IS 'Tabela para armazenar fluxos de teste automatizados';
COMMENT ON TABLE test_executions IS 'Tabela para armazenar execuções de fluxos de teste';

COMMENT ON COLUMN test_flows.steps IS 'Array JSON contendo os passos do fluxo de teste';
COMMENT ON COLUMN test_flows.status IS 'Status do fluxo: draft, active, paused, archived';
COMMENT ON COLUMN test_executions.steps IS 'Array JSON com detalhes da execução de cada passo';
COMMENT ON COLUMN test_executions.duration IS 'Duração total da execução em milissegundos';

-- Verificar se as tabelas foram criadas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_flows') THEN
        RAISE NOTICE '✅ Tabela test_flows criada com sucesso';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_executions') THEN
        RAISE NOTICE '✅ Tabela test_executions criada com sucesso';
    END IF;
END $$; 