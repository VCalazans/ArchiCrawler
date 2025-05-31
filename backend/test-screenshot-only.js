const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function testScreenshotOnly() {
  try {
    console.log('📸 TESTE APENAS DE SCREENSHOT');
    console.log('=============================\n');

    // 1. Login
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    
    console.log('✅ Login OK\n');

    // 2. Criar fluxo apenas com screenshot
    const screenshotName = `test-screenshot-${Date.now()}`;
    
    const testFlowData = {
      name: `Teste Screenshot ${new Date().toISOString()}`,
      description: 'Teste focado apenas em screenshot',
      userId: '00000000-0000-0000-0000-000000000001',
      isActive: true,
      status: 'draft',
      steps: [
        {
          id: 'step-nav',
          name: 'Navegar para página',
          type: 'navigate',
          config: { url: 'https://example.com' },
          timeout: 10000,
          continueOnError: false
        },
        {
          id: 'step-screenshot',
          name: 'Capturar screenshot',
          type: 'screenshot',
          config: { 
            name: screenshotName,
            fullPage: false
          },
          timeout: 5000,
          continueOnError: false
        }
      ]
    };

    console.log('📋 Criando fluxo...');
    const createResponse = await fetch('http://localhost:3001/test-flows', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testFlowData)
    });
    
    const flowData = await createResponse.json();
    const flowId = flowData.data.id;
    console.log(`✅ Fluxo criado: ${flowId}\n`);

    // 3. Executar
    console.log('🚀 Executando...');
    const executeResponse = await fetch(`http://localhost:3001/test-flows/${flowId}/execute`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const executionData = await executeResponse.json();
    const executionId = executionData.data.id;
    console.log(`📦 Execução: ${executionId}\n`);

    // 4. Aguardar
    console.log('⏳ Aguardando 10 segundos...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 5. Verificar resultado
    const resultResponse = await fetch(`http://localhost:3001/test-executions/${executionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const resultData = await resultResponse.json();
    const execution = resultData.data;

    console.log('📊 RESULTADO:');
    console.log(`Status: ${execution.status}`);
    console.log(`Passos: ${execution.completedSteps}/${execution.totalSteps}`);
    console.log(`Duração: ${execution.duration}ms\n`);

    // 6. Verificar passos
    if (execution.steps) {
      execution.steps.forEach((step, index) => {
        console.log(`Passo ${index + 1}: ${step.stepId} - ${step.status} (${step.duration}ms)`);
        if (step.error) {
          console.log(`  Erro: ${step.error}`);
        }
      });
    }

    // 7. Verificar arquivos
    console.log('\n📁 VERIFICANDO ARQUIVOS:');
    
    // Verificar diretório padrão do Downloads (Windows)
    const userProfile = process.env.USERPROFILE;
    const possibleDirs = [
      'D:\\GIT\\ArchiCrawler\\screenshots',
      path.join(userProfile, 'Downloads'),
      'C:\\Users\\Default\\Downloads',
      '.',
      path.join(__dirname, 'screenshots')
    ];
    
    let foundFiles = [];
    
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          const screenshotFiles = files.filter(file => 
            file.includes(screenshotName) || 
            file.includes('screenshot') ||
            file.endsWith('.png')
          );
          
          if (screenshotFiles.length > 0) {
            console.log(`✅ Arquivos encontrados em ${dir}:`);
            screenshotFiles.forEach(file => {
              const filePath = path.join(dir, file);
              const stats = fs.statSync(filePath);
              console.log(`  - ${file} (${stats.size} bytes)`);
              foundFiles.push(filePath);
            });
          }
        } catch (error) {
          console.log(`❌ Erro ao ler ${dir}: ${error.message}`);
        }
      }
    }
    
    if (foundFiles.length === 0) {
      console.log('❌ Nenhum screenshot encontrado em nenhum diretório');
    }

    // 8. Limpar
    await fetch(`http://localhost:3001/test-flows/${flowId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('\n🎯 CONCLUSÃO:');
    console.log(`Screenshots encontrados: ${foundFiles.length}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testScreenshotOnly(); 