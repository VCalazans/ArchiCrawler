const { Client } = require('pg');

async function testDatabaseConnection() {
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
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');

    // Testar uma query simples
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('📊 Informações do banco:');
    console.log('   Hora atual:', result.rows[0].current_time);
    console.log('   Versão:', result.rows[0].version);

    // Verificar se as tabelas existem
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'api_keys', 'mcp_clients')
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('📋 Tabelas de autenticação encontradas:');
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  Nenhuma tabela encontrada (será criada automaticamente)');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
    console.error('   Host:', '145.223.79.190:5432');
    console.error('   Database:', 'archicrawler');
    console.error('   Username:', 'archicode');
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada');
  }
}

// Executar teste
testDatabaseConnection(); 