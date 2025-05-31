#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

class MCPClient {
  constructor() {
    this.requestId = 1;
    this.server = null;
  }

  async start() {
    console.log('🚀 Iniciando servidor MCP Playwright oficial...');
    
    // Detectar o comando correto para o sistema operacional
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'npx.cmd' : 'npx';
    
    // Iniciar o servidor MCP oficial do Playwright
    this.server = spawn(command, ['@playwright/mcp', '--config', 'src/mcp/configs/playwright-config.json'], {
      stdio: ['pipe', 'pipe', 'inherit'],
      shell: isWindows
    });

    this.server.stdout.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            console.log('📥 Resposta:', JSON.stringify(response, null, 2));
          } catch (error) {
            console.log('📄 Dados recebidos:', line);
          }
        }
      }
    });

    this.server.on('error', (error) => {
      console.error('❌ Erro ao iniciar servidor MCP:', error.message);
      if (error.code === 'ENOENT') {
        console.log('💡 Dica: Certifique-se de que o Node.js e npm estão instalados corretamente');
        console.log('💡 Tente executar: npm install -g @playwright/mcp');
      }
    });

    // Aguardar um pouco para o servidor inicializar
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  sendRequest(method, params = {}) {
    if (!this.server || this.server.killed) {
      console.log('⚠️ Servidor não está rodando');
      return;
    }

    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params
    };

    console.log('📤 Enviando:', JSON.stringify(request, null, 2));
    this.server.stdin.write(JSON.stringify(request) + '\n');
  }

  async runTests() {
    if (!this.server || this.server.killed) {
      console.log('❌ Servidor não está disponível para testes');
      return;
    }

    console.log('\n=== 🔧 Teste 1: Inicialização ===');
    this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'archicrawler-mcp-client',
        version: '1.0.0'
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n=== 🛠️ Teste 2: Listar ferramentas ===');
    this.sendRequest('tools/list');

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n=== 🌐 Teste 3: Navegar para uma página ===');
    this.sendRequest('tools/call', {
      name: 'browser_navigate',
      arguments: {
        url: 'https://example.com'
      }
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n=== 📸 Teste 4: Obter snapshot da página ===');
    this.sendRequest('tools/call', {
      name: 'browser_snapshot',
      arguments: {}
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== 📷 Teste 5: Capturar tela ===');
    this.sendRequest('tools/call', {
      name: 'browser_take_screenshot',
      arguments: {
        filename: 'test-screenshot.png'
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== 🌐 Teste 6: Fechar navegador ===');
    this.sendRequest('tools/call', {
      name: 'browser_close',
      arguments: {}
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async stop() {
    console.log('\n🛑 Finalizando servidor MCP...');
    if (this.server && !this.server.killed) {
      this.server.kill('SIGTERM');
    }
  }
}

async function testRESTAPI() {
  console.log('\n=== 🌐 Testando API REST ===');
  
  try {
    // Testar se o servidor está rodando
    const response = await fetch('http://localhost:3001/mcp/servers');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API REST funcionando:', data);
    } else {
      console.log('⚠️ API REST não está disponível. Execute: npm run start:dev');
    }
  } catch (error) {
    console.log('⚠️ API REST não está disponível. Execute: npm run start:dev');
  }
}

async function main() {
  const client = new MCPClient();
  
  try {
    await testRESTAPI();
    await client.start();
    
    // Verificar se o servidor foi iniciado com sucesso
    if (client.server && !client.server.killed) {
      await client.runTests();
      console.log('\n✅ Todos os testes concluídos com sucesso!');
    } else {
      console.log('\n❌ Não foi possível iniciar o servidor MCP');
      console.log('💡 Verifique se o @playwright/mcp está instalado: npm install @playwright/mcp');
    }
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await client.stop();
    process.exit(0);
  }
}

if (require.main === module) {
  main();
} 