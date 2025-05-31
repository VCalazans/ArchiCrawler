const { spawn } = require('child_process');

console.log('🧪 Teste de Execução MCP com Playwright');
console.log('======================================');

// Comando para startar MCP Playwright
const mcpCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const mcpArgs = ['@playwright/mcp'];

console.log(`📦 Iniciando MCP: ${mcpCommand} ${mcpArgs.join(' ')}`);

const mcpProcess = spawn(mcpCommand, mcpArgs, {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
  env: { ...process.env }
});

let requestId = 1;

// Função para enviar mensagem MCP
function sendMCPMessage(message) {
  console.log(`📤 Enviando: ${JSON.stringify(message)}`);
  mcpProcess.stdin.write(JSON.stringify(message) + '\n');
}

// Handler de resposta
mcpProcess.stdout.on('data', (data) => {
  const text = data.toString();
  console.log('📥 Resposta MCP:', text.trim());
  
  try {
    const response = JSON.parse(text.trim());
    handleMCPResponse(response);
  } catch (e) {
    console.log('📝 Texto não-JSON:', text.trim());
  }
});

mcpProcess.stderr.on('data', (data) => {
  console.log('❌ STDERR:', data.toString());
});

mcpProcess.on('error', (error) => {
  console.error('💥 Erro no processo:', error.message);
});

mcpProcess.on('exit', (code, signal) => {
  console.log(`🔚 Processo finalizado - código: ${code}, sinal: ${signal}`);
});

// Handler das respostas
function handleMCPResponse(response) {
  if (response.id === 1) {
    console.log('✅ MCP inicializado! Capabilities:', response.result?.capabilities);
    
    // Enviar notificação de inicialização completa
    sendMCPMessage({
      jsonrpc: '2.0',
      method: 'notifications/initialized'
    });
    
    // Testar navegação após 2 segundos
    setTimeout(testNavigation, 2000);
  }
}

// Teste de navegação
function testNavigation() {
  console.log('\n🚀 Testando navegação...');
  
  sendMCPMessage({
    jsonrpc: '2.0',
    id: ++requestId,
    method: 'tools/call',
    params: {
      name: 'playwright_navigate',
      arguments: {
        url: 'https://google.com',
        browserType: 'chromium',
        headless: false, // Importante: navegador visível
        width: 1280,
        height: 720,
        waitUntil: 'domcontentloaded'
      }
    }
  });
  
  // Timeout para finalizar teste
  setTimeout(() => {
    console.log('\n🏁 Finalizando teste...');
    mcpProcess.kill();
    process.exit(0);
  }, 15000); // 15 segundos para ver o navegador
}

// Inicialização após 2 segundos
setTimeout(() => {
  console.log('\n🤝 Inicializando protocolo MCP...');
  
  sendMCPMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: { sampling: {} },
      clientInfo: { 
        name: 'archicrawler-test-client', 
        version: '1.0.0' 
      }
    }
  });
}, 2000); 