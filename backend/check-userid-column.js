const { Client } = require('pg');

async function checkUserIdColumn() {
  const client = new Client({
    host: '145.223.79.190',
    port: 5432,
    user: 'archicode',
    password: '#Archicode2025',
    database: 'archicrawler',
    ssl: false,
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Verificar se coluna userId existe
    const checkQuery = `
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'generated_tests' 
      AND column_name = 'userId';
    `;
    
    const result = await client.query(checkQuery);
    
    if (result.rows.length > 0) {
      console.log('✅ Coluna userId EXISTE na tabela generated_tests:');
      console.log('📊 Detalhes:', result.rows[0]);
    } else {
      console.log('❌ Coluna userId NÃO EXISTE na tabela generated_tests');
    }

    // Verificar todas as colunas da tabela
    const allColumnsQuery = `
      SELECT column_name, is_nullable, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'generated_tests'
      ORDER BY ordinal_position;
    `;
    
    const allColumns = await client.query(allColumnsQuery);
    console.log('\n📋 Todas as colunas da tabela generated_tests:');
    allColumns.rows.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada');
  }
}

checkUserIdColumn(); 