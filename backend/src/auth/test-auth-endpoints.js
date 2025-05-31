const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAuthEndpoints() {
  console.log('🧪 Testando endpoints de autenticação...\n');

  try {
    // 1. Testar login
    console.log('1️⃣ Testando login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('📄 Resposta:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.access_token;
    
    // 2. Testar perfil
    console.log('\n2️⃣ Testando perfil...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Perfil obtido!');
    console.log('📄 Resposta:', JSON.stringify(profileResponse.data, null, 2));
    
    // 3. Testar API Key com credenciais padrão
    console.log('\n3️⃣ Testando API Key padrão...');
    const apiKeyResponse = await axios.get(`${BASE_URL}/auth/test-api-key`, {
      headers: {
        'X-API-Key': 'ak_default_admin_key_2024_archicrawler_system'
      }
    });
    
    console.log('✅ API Key válida!');
    console.log('📄 Resposta:', JSON.stringify(apiKeyResponse.data, null, 2));
    
    // 4. Testar cliente MCP padrão
    console.log('\n4️⃣ Testando cliente MCP padrão...');
    const mcpResponse = await axios.get(`${BASE_URL}/auth/test-mcp`, {
      headers: {
        'X-MCP-Client-ID': 'mcp_archicrawler_default_client_2024',
        'X-MCP-Client-Secret': 'archicrawler_mcp_secret_key_2024_default_client_secure'
      }
    });
    
    console.log('✅ Cliente MCP válido!');
    console.log('📄 Resposta:', JSON.stringify(mcpResponse.data, null, 2));
    
    // 5. Testar estatísticas
    console.log('\n5️⃣ Testando estatísticas...');
    const statsResponse = await axios.get(`${BASE_URL}/auth/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Estatísticas obtidas!');
    console.log('📄 Resposta:', JSON.stringify(statsResponse.data, null, 2));
    
    console.log('\n🎉 Todos os testes passaram! Sistema de autenticação funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n💡 Dica: Verifique se o ValidationPipe está configurado corretamente');
    }
    
    if (error.response?.status === 401) {
      console.log('\n💡 Dica: Verifique as credenciais ou se o banco foi migrado corretamente');
    }
  }
}

// Executar testes
testAuthEndpoints(); 