const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function debugMCPConfig() {
  console.log('🔍 DIAGNÓSTICO DA CONFIGURAÇÃO MCP');
  console.log('=================================\n');

  let hasPlaywrightMCP = false;

  // 1. Verificar se @playwright/mcp está instalado
  console.log('📦 Verificando instalação do @playwright/mcp...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    hasPlaywrightMCP = packageJson.dependencies?.['@playwright/mcp'] || 
                      packageJson.devDependencies?.['@playwright/mcp'];
    
    if (hasPlaywrightMCP) {
      console.log(`✅ @playwright/mcp encontrado: ${hasPlaywrightMCP}`);
      hasPlaywrightMCP = true;
    } else {
      console.log('❌ @playwright/mcp NÃO encontrado no package.json');
      console.log('🔧 Instalando @playwright/mcp...');
      
      const installProcess = spawn('npm', ['install', '@playwright/mcp'], {
        stdio: 'inherit',
        shell: process.platform === 'win32'
      });
      
      await new Promise((resolve, reject) => {
        installProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ @playwright/mcp instalado com sucesso!');
            hasPlaywrightMCP = true;
            resolve();
          } else {
            console.log('❌ Erro na instalação');
            reject(new Error(`Instalação falhou com código ${code}`));
          }
        });
      });
    }
  } catch (error) {
    console.error('❌ Erro ao verificar package.json:', error.message);
  }

  // 2. Verificar arquivo de configuração
  const configPath = path.join(__dirname, 'src', 'mcp', 'configs', 'playwright-config.json');
  console.log(`\n📁 Verificando arquivo de configuração: ${configPath}`);
  
  const configExists = fs.existsSync(configPath);
  if (configExists) {
    console.log('✅ Arquivo de configuração encontrado');
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('✅ Configuração JSON válida');
      console.log(`   - Browser: ${config.browser}`);
      console.log(`   - Headless: ${config.headless}`);
      console.log(`   - Viewport: ${config.viewport?.width}x${config.viewport?.height}`);
    } catch (error) {
      console.error('❌ Erro ao ler configuração:', error.message);
    }
  } else {
    console.error('❌ Arquivo de configuração não encontrado');
    return;
  }

  // 3. Testar comando npx diretamente
  console.log('\n🧪 Testando comando npx @playwright/mcp...');
  
  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'npx.cmd' : 'npx';
  const args = ['@playwright/mcp', '--config', configPath];
  
  console.log(`Comando: ${command} ${args.join(' ')}`);
  
  const testProcess = spawn(command, args, {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: isWindows,
    cwd: process.cwd()
  });

  let hasOutput = false;
  let initSuccess = false;

  // Escutar saída
  testProcess.stdout?.on('data', (data) => {
    hasOutput = true;
    console.log('📥 Saída MCP:', data.toString().trim());
  });

  // Escutar erros
  testProcess.on('error', (error) => {
    console.error('❌ Erro no processo:', error.message);
    if (error.code === 'ENOENT') {
      console.log('💡 Comando não encontrado. Verifique se npx está disponível.');
    }
  });

  // Aguardar inicialização
  console.log('⏳ Aguardando 5 segundos para verificar se o processo inicia...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Testar inicialização MCP
  if (hasOutput) {
    console.log('\n📤 Testando protocolo MCP...');
    
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'debug-client',
          version: '1.0.0'
        }
      }
    };

    testProcess.stdin?.write(JSON.stringify(initRequest) + '\n');
    
    // Aguardar resposta
    testProcess.stdout?.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        if (response.id === 1 && response.result) {
          console.log('✅ Inicialização MCP bem-sucedida!');
          console.log(`   Servidor: ${response.result.serverInfo?.name}`);
          console.log(`   Versão: ${response.result.serverInfo?.version}`);
          initSuccess = true;
          
          // Testar lista de ferramentas
          const listRequest = {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list'
          };
          
          testProcess.stdin?.write(JSON.stringify(listRequest) + '\n');
        }
      } catch (error) {
        // Ignorar erros de parsing
      }
    });

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Finalizar processo
  testProcess.kill('SIGTERM');

  // 4. Resumo do diagnóstico
  console.log('\n🎯 RESUMO DO DIAGNÓSTICO:');
  console.log('========================');
  console.log(`📦 @playwright/mcp instalado: ${hasPlaywrightMCP ? '✅' : '❌'}`);
  console.log(`📁 Arquivo config encontrado: ${configExists ? '✅' : '❌'}`);
  console.log(`🚀 Processo MCP inicia: ${hasOutput ? '✅' : '❌'}`);
  console.log(`🔌 Protocolo MCP funciona: ${initSuccess ? '✅' : '❌'}`);

  if (!hasOutput) {
    console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar se npm/npx estão funcionando: npx --version');
    console.log('2. Instalar playwright: npx playwright install');
    console.log('3. Reinstalar @playwright/mcp: npm uninstall @playwright/mcp && npm install @playwright/mcp');
    console.log('4. Verificar permissões de arquivo');
    console.log('5. O MCP pode estar falhando silenciosamente - verificar versão do Node.js');
  }

  if (hasOutput && !initSuccess) {
    console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar formato do arquivo de configuração');
    console.log('2. Atualizar @playwright/mcp para versão mais recente');
    console.log('3. Verificar logs de erro do processo MCP');
  }

  // 5. Testar instalação do Playwright
  if (hasPlaywrightMCP && !hasOutput) {
    console.log('\n🎭 Verificando instalação do Playwright...');
    try {
      const playwrightTest = spawn('npx', ['playwright', '--version'], {
        stdio: 'pipe',
        shell: isWindows
      });
      
      playwrightTest.stdout?.on('data', (data) => {
        console.log(`✅ Playwright encontrado: ${data.toString().trim()}`);
      });
      
      playwrightTest.on('error', () => {
        console.log('❌ Playwright não encontrado');
        console.log('🔧 Execute: npx playwright install');
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      playwrightTest.kill('SIGTERM');
    } catch (error) {
      console.log('❌ Erro ao verificar Playwright');
    }
  }
}

debugMCPConfig().catch(console.error); 