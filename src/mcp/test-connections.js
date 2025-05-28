#!/usr/bin/env node

const { spawn } = require('child_process');

async function testConnections() {
  console.log('🔗 Testando Conexões MCP do ArchiCrawler\n');

  try {
    // Testar API REST
    console.log('=== 🌐 Testando API REST ===');
    const response = await fetch('http://localhost:3001/mcp/servers');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API REST funcionando');
      console.log('📋 Servidores disponíveis:');
      data.servers.forEach(server => {
        console.log(`  - ${server.name}: ${server.isRunning ? '🟢 Rodando' : '🔴 Parado'}`);
        console.log(`    Modo: ${server.networkMode}`);
        if (server.connectionInfo) {
          console.log(`    Conexão: ${server.connectionInfo.message}`);
          if (server.connectionInfo.url) {
            console.log(`    URL: ${server.connectionInfo.url}`);
          }
        }
      });
    } else {
      console.log('❌ API REST não está disponível');
      console.log('💡 Execute: npm run start:dev');
      return;
    }

    console.log('\n=== 🔗 Informações de Conexão para Clientes Externos ===');
    const connectionsResponse = await fetch('http://localhost:3001/mcp/connections');
    if (connectionsResponse.ok) {
      const connectionsData = await connectionsResponse.json();
      
      if (connectionsData.connections.length === 0) {
        console.log('⚠️ Nenhum servidor MCP configurado para conexão externa');
        console.log('💡 Para conectar clientes externos, inicie o servidor TCP:');
        console.log('   curl -X POST http://localhost:3001/mcp/servers/playwright-tcp/start');
      } else {
        console.log('📡 Servidores disponíveis para clientes externos:');
        connectionsData.connections.forEach(conn => {
          console.log(`\n🔌 ${conn.name}`);
          console.log(`   Status: ${conn.isRunning ? '🟢 Rodando' : '🔴 Parado'}`);
          console.log(`   Tipo: ${conn.connectionType}`);
          console.log(`   URL: ${conn.url}`);
          
          if (conn.clientConfig.claude_desktop) {
            console.log('   📋 Configuração Claude Desktop:');
            console.log('   ```json');
            console.log(JSON.stringify(conn.clientConfig.claude_desktop, null, 2));
            console.log('   ```');
          }
        });

        console.log('\n📚 Instruções:');
        console.log('• Claude Desktop: Adicione a configuração no claude_desktop_config.json');
        console.log('• Cursor: Configure nas configurações MCP');
        console.log('• Outros clientes: Use as URLs fornecidas');
      }
    }

    console.log('\n=== 🚀 Comandos Úteis ===');
    console.log('• Iniciar servidor TCP: curl -X POST http://localhost:3001/mcp/servers/playwright-tcp/start');
    console.log('• Listar servidores: curl http://localhost:3001/mcp/servers');
    console.log('• Ver conexões: curl http://localhost:3001/mcp/connections');
    console.log('• Swagger UI: http://localhost:3001/api');

  } catch (error) {
    console.error('❌ Erro ao testar conexões:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando: npm run start:dev');
  }
}

async function startTcpServer() {
  console.log('🚀 Iniciando servidor MCP TCP...');
  
  try {
    const response = await fetch('http://localhost:3001/mcp/servers/playwright-tcp/start', {
      method: 'POST'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor TCP iniciado com sucesso!');
      if (data.connectionInfo) {
        console.log(`🔗 URL de conexão: ${data.connectionInfo.url}`);
        console.log(`📋 Configure seu cliente MCP para conectar em: ${data.connectionInfo.url}`);
      }
    } else {
      console.log('❌ Erro ao iniciar servidor TCP');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando: npm run start:dev');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--start-tcp')) {
    await startTcpServer();
  } else {
    await testConnections();
  }
}

if (require.main === module) {
  main();
} 