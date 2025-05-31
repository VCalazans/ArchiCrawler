const { Client } = require('pg');

async function addExecutionColumns() {
  const client = new Client({
    host: '145.223.79.190',
    port: 5432,
    user: 'archicode',
    password: '#Archicode2025',
    database: 'archicrawler',
    ssl: false,
  });

  try {
    console.log('🔄 Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    const sql = `
      -- Adicionar colunas de execução na tabela generated_tests
      ALTER TABLE generated_tests 
      ADD COLUMN IF NOT EXISTS last_execution_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS last_successful_execution_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0;

      -- Criar índices para as novas colunas
      CREATE INDEX IF NOT EXISTS idx_generated_tests_last_execution ON generated_tests (last_execution_at);
      CREATE INDEX IF NOT EXISTS idx_generated_tests_execution_count ON generated_tests (execution_count);
    `;

    await client.query(sql);
    console.log('✅ Colunas de execução adicionadas com sucesso!');

  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada');
  }
}

addExecutionColumns(); 