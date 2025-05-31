-- =====================================================
-- Migração 005: Adicionar Colunas de Execução para Generated Tests
-- =====================================================

-- Adicionar colunas de execução na tabela generated_tests
ALTER TABLE generated_tests 
ADD COLUMN IF NOT EXISTS last_execution_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_successful_execution_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0;

-- Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_generated_tests_last_execution ON generated_tests (last_execution_at);
CREATE INDEX IF NOT EXISTS idx_generated_tests_execution_count ON generated_tests (execution_count);

-- Comentários das novas colunas
COMMENT ON COLUMN generated_tests.last_execution_at IS 'Timestamp da última execução do teste (sucesso ou falha)';
COMMENT ON COLUMN generated_tests.last_successful_execution_at IS 'Timestamp da última execução bem-sucedida';
COMMENT ON COLUMN generated_tests.execution_count IS 'Contador total de execuções do teste';

-- =====================================================
-- Relatório final
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migração 005 - Colunas de Execução adicionadas com sucesso!';
    RAISE NOTICE '📊 Colunas adicionadas na tabela generated_tests:';
    RAISE NOTICE '   • last_execution_at - Última execução';
    RAISE NOTICE '   • last_successful_execution_at - Última execução bem-sucedida';
    RAISE NOTICE '   • execution_count - Contador de execuções';
    RAISE NOTICE '🔧 Recursos implementados:';
    RAISE NOTICE '   • Rastreamento de execuções';
    RAISE NOTICE '   • Histórico de sucesso';
    RAISE NOTICE '   • Contadores de uso';
END $$; 