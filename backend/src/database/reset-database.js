const { Client } = require('pg');
const { runMigrations } = require('./run-migrations');

async function resetDatabase() {
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
    console.log('✅ Conexão estabelecida com sucesso!');

    console.log('\n🗑️  Removendo tabelas existentes...');
    
    // Script para limpar todas as tabelas de autenticação
    const dropScript = `
      -- Remover triggers
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
      DROP TRIGGER IF EXISTS update_mcp_clients_updated_at ON mcp_clients;
      
      -- Remover função de trigger
      DROP FUNCTION IF EXISTS update_updated_at_column();
      
      -- Remover tabelas (CASCADE para remover dependências)
      DROP TABLE IF EXISTS api_keys CASCADE;
      DROP TABLE IF EXISTS mcp_clients CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      
      -- Remover enum
      DROP TYPE IF EXISTS user_role CASCADE;
    `;

    await client.query(dropScript);
    console.log('✅ Tabelas removidas com sucesso!');

    // Verificar se as tabelas foram removidas
    const checkQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'api_keys', 'mcp_clients');
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      console.log('✅ Confirmado: Todas as tabelas foram removidas');
    } else {
      console.log('⚠️  Algumas tabelas ainda existem:', checkResult.rows.map(r => r.tablename));
    }

  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada');
  }

  // Executar migrações para recriar tudo
  console.log('\n🔄 Recriando tabelas e dados...');
  await runMigrations();
}

// Executar reset
if (require.main === module) {
  console.log('⚠️  ATENÇÃO: Este script irá APAGAR TODOS os dados de autenticação!');
  console.log('🔄 Iniciando reset do banco de dados em 3 segundos...');
  
  setTimeout(() => {
    resetDatabase();
  }, 3000);
}

module.exports = { resetDatabase }; 