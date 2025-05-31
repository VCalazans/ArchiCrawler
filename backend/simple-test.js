const fetch = require('node-fetch');

async function simpleTest() {
  try {
    console.log('🔐 Fazendo login...');
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    
    if (!token) {
      console.error('❌ Erro no login:', loginData);
      return;
    }
    
    console.log('✅ Login OK');

    console.log('🎭 Testando status Playwright...');
    const statusResponse = await fetch('http://localhost:3001/test-flows/playwright/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const statusData = await statusResponse.json();
    console.log('Status:', statusData);

    console.log('🧪 Iniciando teste de execução...');
    const testResponse = await fetch('http://localhost:3001/test-flows/debug/test-execution', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!testResponse.ok) {
      console.error('❌ Erro HTTP:', testResponse.status, testResponse.statusText);
      const text = await testResponse.text();
      console.log('Response:', text);
      return;
    }
    
    const testData = await testResponse.json();
    console.log('✅ Resultado do teste:', JSON.stringify(testData, null, 2));

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

simpleTest(); 