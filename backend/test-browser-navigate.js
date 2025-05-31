const { spawn } = require('child_process');

console.log('🌐 Teste de Navegação MCP com Nomes Corretos');
console.log('===========================================');

const mcpCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const mcpArgs = ['@playwright/mcp'];

const mcpProcess = spawn(mcpCommand, mcpArgs, {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
  env: { ...process.env }
});

let requestId = 1;

function sendMCPMessage(message) {
  console.log(`📤 Enviando: ${JSON.stringify(message, null, 2)}`);
  mcpProcess.stdin.write(JSON.stringify(message) + '\n');
}

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

function handleMCPResponse(response) {
  if (response.id === 1) {
    console.log('✅ MCP inicializado!');
    
    // Enviar notificação de inicialização
    sendMCPMessage({
      jsonrpc: '2.0',
      method: 'notifications/initialized'
    });
    
    // Testar navegação após 2 segundos
    setTimeout(testBrowserNavigate, 2000);
  } else if (response.id === 2) {
    console.log('\n🎉 NAVEGAÇÃO FUNCIONOU!');
    console.log('📊 Resposta:', JSON.stringify(response, null, 2));
    
    // Testar screenshot após navegação
    setTimeout(testScreenshot, 3000);
  } else if (response.id === 3) {
    console.log('\n📷 SCREENSHOT FUNCIONOU!');
    console.log('📊 Resposta:', JSON.stringify(response, null, 2));
    
    // Finalizar após screenshot
    setTimeout(() => {
      console.log('\n🏁 Teste concluído com sucesso!');
      mcpProcess.kill();
      process.exit(0);
    }, 2000);
  }
}

function testBrowserNavigate() {
  console.log('\n🚀 Testando browser_navigate...');
  
  sendMCPMessage({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'browser_navigate',
      arguments: {
        url: 'https://www.google.com'
      }
    }
  });
}

function testScreenshot() {
  console.log('\n📸 Testando browser_take_screenshot...');
  
  sendMCPMessage({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'browser_take_screenshot',
      arguments: {
        filename: 'teste-sucesso.png'
      }
    }
  });
}

// Inicialização
setTimeout(() => {
  console.log('🤝 Inicializando protocolo MCP...');
  
  sendMCPMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: { sampling: {} },
      clientInfo: { 
        name: 'archicrawler-browser-test', 
        version: '1.0.0' 
      }
    }
  });
}, 1000); 