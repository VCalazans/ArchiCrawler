const { spawn } = require('child_process');

console.log('🔧 Verificando Ferramentas MCP Disponíveis');
console.log('=========================================');

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
    console.log('📋 Capabilities:', JSON.stringify(response.result?.capabilities, null, 2));
    
    // Enviar notificação de inicialização
    sendMCPMessage({
      jsonrpc: '2.0',
      method: 'notifications/initialized'
    });
    
    // Listar ferramentas após 2 segundos
    setTimeout(listTools, 2000);
  } else if (response.id === 2) {
    console.log('\n🛠️ FERRAMENTAS DISPONÍVEIS:');
    console.log('==============================');
    if (response.result?.tools) {
      response.result.tools.forEach((tool, index) => {
        console.log(`${index + 1}. 🔧 ${tool.name}`);
        console.log(`   📝 ${tool.description || 'Sem descrição'}`);
        if (tool.inputSchema?.properties) {
          console.log(`   🎛️ Parâmetros: ${Object.keys(tool.inputSchema.properties).join(', ')}`);
        }
        console.log('');
      });
    } else {
      console.log('❌ Nenhuma ferramenta encontrada!');
      console.log('📊 Resposta completa:', JSON.stringify(response, null, 2));
    }
    
    // Finalizar após listar
    setTimeout(() => {
      console.log('🏁 Finalizando...');
      mcpProcess.kill();
      process.exit(0);
    }, 3000);
  }
}

function listTools() {
  console.log('\n🔍 Listando ferramentas disponíveis...');
  
  sendMCPMessage({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
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
        name: 'archicrawler-tools-check', 
        version: '1.0.0' 
      }
    }
  });
}, 1000); 