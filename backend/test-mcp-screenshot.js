const { MCPManagerService } = require('./dist/src/mcp/mcp-manager.service');

async function testMCPScreenshot() {
  try {
    console.log('📸 TESTE DIRETO MCP SCREENSHOT');
    console.log('=============================\n');

    // Simular o MCPManagerService para teste
    console.log('🔗 Inicializando MCP Manager...');
    
    // Teste direto via linha de comando (simulando MCP)
    const spawn = require('child_process').spawn;
    
    console.log('🎭 Testando navegação...');
    console.log('🌐 Navegando para https://example.com');
    
    console.log('📸 Capturando screenshot...');
    
    // Criar diretório se não existir
    const fs = require('fs');
    const screenshotDir = 'D:\\GIT\\ArchiCrawler\\screenshots';
    
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
      console.log(`📁 Diretório criado: ${screenshotDir}`);
    }
    
    // Aguardar um pouco para simular o processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Teste MCP simulado concluído');
    console.log('\n📋 OPÇÕES PARA RESOLVER O PROBLEMA:');
    console.log('1. Verificar parâmetros corretos do MCP Playwright');
    console.log('2. Testar screenshot diretamente via MCP tools');
    console.log('3. Verificar logs do servidor MCP');
    console.log('4. Usar diretório padrão do sistema (Downloads)');
    
    console.log('\n🔍 INVESTIGAÇÃO NECESSÁRIA:');
    console.log('- Quais parâmetros o MCP playwright_screenshot aceita?');
    console.log('- Onde o MCP salva os screenshots por padrão?');
    console.log('- O parâmetro downloadsDir é suportado?');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testMCPScreenshot(); 