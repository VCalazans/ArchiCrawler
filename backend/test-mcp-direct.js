const { spawn } = require('child_process');

console.log('🧪 Teste direto do MCP Playwright');
console.log('=================================');

// Comando para startar MCP Playwright
const mcpCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const mcpArgs = ['@playwright/mcp'];

console.log(`📦 Comando: ${mcpCommand} ${mcpArgs.join(' ')}`);
console.log(`🌍 Platform: ${process.platform}`);
console.log(`📂 Diretório: ${process.cwd()}`);

const mcpProcess = spawn(mcpCommand, mcpArgs, {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
  env: { ...process.env }
});

let buffer = '';

mcpProcess.stdout.on('data', (data) => {
  const text = data.toString();
  buffer += text;
  console.log('📤 STDOUT:', text);
  
  // Tentar parsear mensagens JSON
  const lines = buffer.split('\n');
  for (const line of lines) {
    if (line.trim()) {
      try {
        const parsed = JSON.parse(line.trim());
        console.log('✅ JSON recebido:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('📝 Texto normal:', line.trim());
      }
    }
  }
});

mcpProcess.stderr.on('data', (data) => {
  console.log('❌ STDERR:', data.toString());
});

mcpProcess.on('error', (error) => {
  console.error('💥 Erro no processo:', error.message);
  
  if (error.message.includes('ENOENT')) {
    console.error('❌ @playwright/mcp não encontrado!');
    console.error('💡 Execute: npm install @playwright/mcp');
  }
});

mcpProcess.on('exit', (code, signal) => {
  console.log(`🔚 Processo finalizado - código: ${code}, sinal: ${signal}`);
});

// Testar inicialização após 3 segundos
setTimeout(() => {
  console.log('\n🤝 Testando inicialização MCP...');
  
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: { sampling: {} },
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  };
  
  console.log('📤 Enviando:', JSON.stringify(initMessage));
  mcpProcess.stdin.write(JSON.stringify(initMessage) + '\n');
}, 3000);

// Cleanup após 10 segundos
setTimeout(() => {
  console.log('\n🛑 Finalizando teste...');
  mcpProcess.kill();
  process.exit(0);
}, 10000); 