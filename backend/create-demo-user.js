const { Client } = require('pg');

async function createDemoUser() {
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

    const demoUserId = '00000000-0000-4000-8000-000000000000';
    
    // Verificar se já existe
    const checkQuery = 'SELECT id FROM users WHERE id = $1;';
    const checkResult = await client.query(checkQuery, [demoUserId]);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Usuário demo já existe!');
      return;
    }

    // Criar usuário demo
    const insertQuery = `
      INSERT INTO users (id, username, email, password, "createdAt") 
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (id) DO NOTHING;
    `;
    
    await client.query(insertQuery, [
      demoUserId,
      'demo-llm-user',
      'demo-llm@archicrawler.com',
      '$2b$10$demoPasswordHash123456789' // Hash simples para demo
    ]);

    console.log(`✅ Usuário demo criado: ${demoUserId}`);
    console.log('👤 Username: demo-llm-user');
    console.log('📧 Email: demo-llm@archicrawler.com');

  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
  } finally {
    await client.end();
    console.log('🔌 Conexão fechada');
  }
}

createDemoUser(); 