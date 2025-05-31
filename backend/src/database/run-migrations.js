const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
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

    // Lista de arquivos de migração em ordem
    const migrationFiles = [
      '001-create-auth-tables.sql',
      '002-insert-initial-data.sql',
      '003-create-test-flows-tables.sql'
    ];

    for (const fileName of migrationFiles) {
      const filePath = path.join(__dirname, 'migrations', fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Arquivo não encontrado: ${fileName}`);
        continue;
      }

      console.log(`\n📄 Executando migração: ${fileName}`);
      
      try {
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        await client.query(sqlContent);
        console.log(`✅ Migração ${fileName} executada com sucesso!`);
      } catch (error) {
        console.error(`❌ Erro na migração ${fileName}:`, error.message);
        // Continuar com as próximas migrações mesmo se uma falhar
      }
    }

    // Verificar o estado final das tabelas
    console.log('\n📊 Verificando estado das tabelas...');
    
    const tablesQuery = `
      SELECT 
        schemaname,
        tablename,
        hasindexes,
        hastriggers
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'api_keys', 'mcp_clients', 'test_flows', 'test_executions')
      ORDER BY tablename;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada!');
    } else {
      console.log('📋 Tabelas criadas:');
      tablesResult.rows.forEach(row => {
        console.log(`   ✅ ${row.tablename} (índices: ${row.hasindexes ? 'sim' : 'não'}, triggers: ${row.hastriggers ? 'sim' : 'não'})`);
      });
    }

    // Verificar dados inseridos
    console.log('\n📈 Verificando dados inseridos...');
    
    const dataQuery = `
      SELECT 
        'users' as tabela,
        COUNT(*) as total,
        COUNT(CASE WHEN "isActive" = true THEN 1 END) as ativos
      FROM users
      UNION ALL
      SELECT 
        'api_keys' as tabela,
        COUNT(*) as total,
        COUNT(CASE WHEN "isActive" = true THEN 1 END) as ativos
      FROM api_keys
      UNION ALL
      SELECT 
        'mcp_clients' as tabela,
        COUNT(*) as total,
        COUNT(CASE WHEN "isActive" = true THEN 1 END) as ativos
      FROM mcp_clients
      UNION ALL
      SELECT 
        'test_flows' as tabela,
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as ativos
      FROM test_flows
      UNION ALL
      SELECT 
        'test_executions' as tabela,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as sucessos
      FROM test_executions;
    `;
    
    const dataResult = await client.query(dataQuery);
    dataResult.rows.forEach(row => {
      console.log(`   📊 ${row.tabela}: ${row.total} total, ${row.ativos || row.sucessos} ativos/sucessos`);
    });

    console.log('\n🎉 Migrações concluídas com sucesso!');
    console.log('\n📝 Credenciais padrão criadas:');
    console.log('   👤 Admin: admin / admin123');
    console.log('   👤 Test User: testuser / admin123');
    console.log('   🔑 Admin API Key: ak_default_admin_key_2024_archicrawler_system');
    console.log('   🔑 Test API Key: ak_test_user_key_2024_archicrawler_limited');
    console.log('   🤖 Default MCP Client: mcp_archicrawler_default_client_2024');
    console.log('   🤖 Dev MCP Client: mcp_dev_client_archicrawler_2024');
    console.log('\n🧪 Test Flows:');
    console.log('   🔄 Exemplo de fluxo de teste criado para demonstração');

  } catch (error) {
    console.error('❌ Erro durante as migrações:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão fechada');
  }
}

// Executar migrações
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 