#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';

async function testAuthentication() {
  console.log('🔐 Testando Sistema de Autenticação do ArchiCrawler\n');

  try {
    // 1. Login
    console.log('=== 🔑 Teste de Login ===');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Falha no login');
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login realizado com sucesso');
    console.log(`🎫 Token: ${loginData.access_token.substring(0, 20)}...`);
    
    const token = loginData.access_token;

    // 2. Criar API Key
    console.log('\n=== 🔑 Criando API Key ===');
    const apiKeyResponse = await fetch(`${BASE_URL}/auth/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test API Key',
        permissions: ['mcp:*', 'playwright:*'],
        expiresInDays: 30
      })
    });

    if (!apiKeyResponse.ok) {
      console.log('❌ Falha ao criar API Key');
      return;
    }

    const apiKeyData = await apiKeyResponse.json();
    console.log('✅ API Key criada com sucesso');
    console.log(`🔑 API Key: ${apiKeyData.apiKey.key}`);
    
    const apiKey = apiKeyData.apiKey.key;

    // 3. Testar API Key
    console.log('\n=== 🧪 Testando API Key ===');
    const testApiKeyResponse = await fetch(`${BASE_URL}/auth/test-api-key`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    if (testApiKeyResponse.ok) {
      const testData = await testApiKeyResponse.json();
      console.log('✅ API Key válida');
      console.log(`👤 Usuário: ${testData.user.username}`);
      console.log(`🎯 Permissões: ${testData.apiKey.permissions.join(', ')}`);
    } else {
      console.log('❌ API Key inválida');
    }

    // 4. Criar Cliente MCP
    console.log('\n=== 🤖 Criando Cliente MCP ===');
    const mcpClientResponse = await fetch(`${BASE_URL}/auth/mcp-clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test MCP Client',
        permissions: ['mcp:*', 'playwright:*'],
        allowedIPs: ['127.0.0.1', '::1']
      })
    });

    if (!mcpClientResponse.ok) {
      console.log('❌ Falha ao criar cliente MCP');
      return;
    }

    const mcpClientData = await mcpClientResponse.json();
    console.log('✅ Cliente MCP criado com sucesso');
    console.log(`🆔 Client ID: ${mcpClientData.client.clientId}`);
    console.log(`🔐 Client Secret: ${mcpClientData.client.clientSecret.substring(0, 20)}...`);
    
    const clientId = mcpClientData.client.clientId;
    const clientSecret = mcpClientData.client.clientSecret;

    // 5. Testar Cliente MCP
    console.log('\n=== 🧪 Testando Cliente MCP ===');
    const testMcpResponse = await fetch(`${BASE_URL}/auth/test-mcp`, {
      headers: {
        'X-MCP-Client-ID': clientId,
        'X-MCP-Client-Secret': clientSecret
      }
    });

    if (testMcpResponse.ok) {
      const testMcpData = await testMcpResponse.json();
      console.log('✅ Cliente MCP válido');
      console.log(`🤖 Nome: ${testMcpData.client.name}`);
      console.log(`🎯 Permissões: ${testMcpData.client.permissions.join(', ')}`);
      console.log(`🌐 IPs Permitidos: ${testMcpData.client.allowedIPs.join(', ')}`);
    } else {
      console.log('❌ Cliente MCP inválido');
    }

    // 6. Testar MCP com autenticação
    console.log('\n=== 🎭 Testando MCP com Autenticação ===');
    const mcpNavigateResponse = await fetch(`${BASE_URL}/mcp/playwright/navigate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MCP-Client-ID': clientId,
        'X-MCP-Client-Secret': clientSecret
      },
      body: JSON.stringify({
        url: 'https://google.com'
      })
    });

    if (mcpNavigateResponse.ok) {
      const mcpData = await mcpNavigateResponse.json();
      console.log('✅ Navegação MCP autenticada realizada com sucesso');
      console.log(`📊 Resultado: ${mcpData.success ? 'Sucesso' : 'Falha'}`);
    } else {
      console.log('❌ Falha na navegação MCP autenticada');
      const errorData = await mcpNavigateResponse.json();
      console.log(`❌ Erro: ${errorData.message || 'Erro desconhecido'}`);
    }

    // 7. Testar controle de acesso com API Key
    console.log('\n=== 🛡️ Testando Controle de Acesso ===');
    const startServerResponse = await fetch(`${BASE_URL}/mcp/servers/playwright/start`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey
      }
    });

    if (startServerResponse.ok) {
      console.log('✅ Controle de acesso com API Key funcionando');
    } else {
      console.log('❌ Falha no controle de acesso');
    }

    // 8. Verificar permissões
    console.log('\n=== 🎯 Verificando Permissões ===');
    const permissionResponse = await fetch(`${BASE_URL}/auth/check-permission?permission=mcp:call-tool`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    if (permissionResponse.ok) {
      const permissionData = await permissionResponse.json();
      console.log(`✅ Permissão 'mcp:call-tool': ${permissionData.hasPermission ? 'Permitida' : 'Negada'}`);
    }

    // 9. Estatísticas
    console.log('\n=== 📊 Estatísticas de Autenticação ===');
    const statsResponse = await fetch(`${BASE_URL}/auth/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('📈 Estatísticas:');
      console.log(`   👥 Usuários: ${statsData.stats.users.total} (${statsData.stats.users.active} ativos)`);
      console.log(`   🔑 API Keys: ${statsData.stats.apiKeys.total} (${statsData.stats.apiKeys.active} ativas)`);
      console.log(`   🤖 Clientes MCP: ${statsData.stats.mcpClients.total} (${statsData.stats.mcpClients.active} ativos)`);
    }

    console.log('\n🎉 Todos os testes de autenticação concluídos com sucesso!');
    
    // Informações para uso
    console.log('\n📋 Credenciais para uso:');
    console.log(`🔑 API Key: ${apiKey}`);
    console.log(`🤖 MCP Client ID: ${clientId}`);
    console.log(`🔐 MCP Client Secret: ${clientSecret}`);
    
    console.log('\n📖 Exemplos de uso:');
    console.log('# Usar API Key:');
    console.log(`curl -H "X-API-Key: ${apiKey}" ${BASE_URL}/mcp/servers`);
    console.log('\n# Usar Cliente MCP:');
    console.log(`curl -H "X-MCP-Client-ID: ${clientId}" -H "X-MCP-Client-Secret: ${clientSecret}" ${BASE_URL}/auth/test-mcp`);

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando: npm run start:dev');
  }
}

if (require.main === module) {
  testAuthentication();
} 