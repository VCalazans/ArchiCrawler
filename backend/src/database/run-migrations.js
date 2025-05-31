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
      '003-create-test-flows-tables.sql',
      '004-create-llm-tests-tables.sql'
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
      AND tablename IN (
        'users', 'api_keys', 'mcp_clients', 'test_flows', 'test_executions',
        'user_api_keys', 'generated_tests', 'llm_provider_configs'
      )
      ORDER BY tablename;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada!');
    } else {
      console.log('📋 Tabelas criadas:');
      tablesResult.rows.forEach(row => {
        const isLLMTable = ['user_api_keys', 'generated_tests', 'llm_provider_configs'].includes(row.tablename);
        const prefix = isLLMTable ? '🤖' : '📊';
        console.log(`   ${prefix} ${row.tablename} (índices: ${row.hasindexes ? 'sim' : 'não'}, triggers: ${row.hastriggers ? 'sim' : 'não'})`);
      });
    }

    // Verificar dados inseridos
    console.log('\n📈 Verificando dados inseridos...');
    
    // Verificar tabelas existentes antes de fazer query
    const existingTables = tablesResult.rows.map(row => row.tablename);
    
    let dataQueries = [];
    
    if (existingTables.includes('users')) {
      dataQueries.push(`
        SELECT 
          'users' as tabela,
          COUNT(*) as total,
          COUNT(CASE WHEN "isActive" = true THEN 1 END) as ativos
        FROM users
      `);
    }
    
    if (existingTables.includes('api_keys')) {
      dataQueries.push(`
        SELECT 
          'api_keys' as tabela,
          COUNT(*) as total,
          COUNT(CASE WHEN "isActive" = true THEN 1 END) as ativos
        FROM api_keys
      `);
    }
    
    if (existingTables.includes('test_flows')) {
      dataQueries.push(`
        SELECT 
          'test_flows' as tabela,
          COUNT(*) as total,
          COUNT(CASE WHEN is_active = true THEN 1 END) as ativos
        FROM test_flows
      `);
    }

    // Verificar tabelas do módulo LLM Tests
    if (existingTables.includes('user_api_keys')) {
      dataQueries.push(`
        SELECT 
          'user_api_keys' as tabela,
          COUNT(*) as total,
          COUNT(CASE WHEN "isActive" = true THEN 1 END) as ativos
        FROM user_api_keys
      `);
    }

    if (existingTables.includes('generated_tests')) {
      dataQueries.push(`
        SELECT 
          'generated_tests' as tabela,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'validated' THEN 1 END) as validados
        FROM generated_tests
      `);
    }

    if (existingTables.includes('llm_provider_configs')) {
      dataQueries.push(`
        SELECT 
          'llm_provider_configs' as tabela,
          COUNT(*) as total,
          COUNT(CASE WHEN "isActive" = true THEN 1 END) as ativos
        FROM llm_provider_configs
      `);
    }

    if (dataQueries.length > 0) {
      const dataQuery = dataQueries.join(' UNION ALL ');
      const dataResult = await client.query(dataQuery);
      
      dataResult.rows.forEach(row => {
        const isLLMTable = ['user_api_keys', 'generated_tests', 'llm_provider_configs'].includes(row.tabela);
        const prefix = isLLMTable ? '🤖' : '📊';
        const statusLabel = row.validados !== undefined ? 'validados' : (row.ativos !== undefined ? 'ativos' : 'sucessos');
        const statusCount = row.validados || row.ativos || row.sucessos || 0;
        console.log(`   ${prefix} ${row.tabela}: ${row.total} total, ${statusCount} ${statusLabel}`);
      });
    }

    console.log('\n🎉 Migrações concluídas com sucesso!');
    console.log('\n📝 Credenciais padrão criadas:');
    console.log('   👤 Admin: admin / admin123');
    console.log('   👤 Test User: testuser / admin123');
    console.log('   🔑 Admin API Key: ak_default_admin_key_2024_archicrawler_system');
    console.log('   🔑 Test API Key: ak_test_user_key_2024_archicrawler_limited');
    console.log('   🤖 Default MCP Client: mcp_archicrawler_default_client_2024');
    console.log('   🤖 Dev MCP Client: mcp_dev_client_archicrawler_2024');
    
    if (existingTables.includes('llm_provider_configs')) {
      console.log('\n🧠 Módulo LLM Tests:');
      console.log('   🤖 Provedores LLM configurados: OpenAI, Anthropic, Gemini');
      console.log('   🔐 Sistema de criptografia AES-256 para API keys');
      console.log('   ⚡ Pronto para gerar testes automatizados!');
    }

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