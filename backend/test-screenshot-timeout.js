const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function testScreenshotAndTimeout() {
  try {
    console.log('🧪 TESTE DE SCREENSHOT E TIMEOUT');
    console.log('================================\n');

    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    
    if (!token) {
      console.error('❌ Erro no login:', loginData);
      return;
    }
    
    console.log('✅ Login OK\n');

    // 2. Criar fluxo com timeouts específicos e screenshot
    const testName = `test-${Date.now()}`;
    const screenshotName = `screenshot-${testName}`;
    
    const testFlowData = {
      name: `Teste Screenshot/Timeout ${new Date().toISOString()}`,
      description: 'Teste para validar screenshots e timeouts',
      userId: '00000000-0000-0000-0000-000000000001',
      isActive: true,
      status: 'draft',
      steps: [
        {
          id: 'step-1',
          name: 'Navegar com timeout customizado',
          type: 'navigate',
          config: { url: 'https://www.google.com' },
          timeout: 10000, // 10 segundos
          continueOnError: false
        },
        {
          id: 'step-2',
          name: 'Screenshot com configuração customizada',
          type: 'screenshot',
          config: { 
            name: screenshotName,
            fullPage: true,
            savePath: 'D:\\GIT\\ArchiCrawler\\screenshots'
          },
          timeout: 5000, // 5 segundos
          continueOnError: true
        },
        {
          id: 'step-3',
          name: 'Wait com duração específica',
          type: 'wait',
          config: { duration: 2000 }, // 2 segundos
          timeout: 3000,
          continueOnError: true
        }
      ]
    };

    console.log('📋 Criando fluxo de teste...');
    const createResponse = await fetch('http://localhost:3001/test-flows', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testFlowData)
    });
    
    const flowData = await createResponse.json();
    if (!flowData.success) {
      console.error('❌ Erro ao criar fluxo:', flowData);
      return;
    }
    
    const flowId = flowData.data.id;
    console.log(`✅ Fluxo criado: ${flowId}\n`);

    // 3. Verificar que o diretório de screenshots existe
    const screenshotDir = 'D:\\GIT\\ArchiCrawler\\screenshots';
    if (!fs.existsSync(screenshotDir)) {
      console.log('📁 Criando diretório de screenshots...');
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // 4. Executar o fluxo
    console.log('🚀 Iniciando execução do fluxo...');
    const startTime = Date.now();
    
    const executeResponse = await fetch(`http://localhost:3001/test-flows/${flowId}/execute`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const executionData = await executeResponse.json();
    if (!executionData.success) {
      console.error('❌ Erro ao executar fluxo:', executionData);
      return;
    }
    
    const executionId = executionData.data.id;
    console.log(`📦 Execução iniciada: ${executionId}\n`);

    // 5. Aguardar e monitorar execução
    console.log('⏳ Aguardando execução (15 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // 6. Verificar resultado da execução
    const resultResponse = await fetch(`http://localhost:3001/test-executions/${executionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const resultData = await resultResponse.json();
    const execution = resultData.data;

    console.log('📊 RESULTADOS DA EXECUÇÃO:');
    console.log('=========================');
    console.log(`Status: ${execution.status}`);
    console.log(`Passos: ${execution.completedSteps}/${execution.totalSteps} (${execution.failedSteps} falhas)`);
    console.log(`Duração: ${execution.duration}ms`);
    console.log(`Tempo total do teste: ${totalTime}ms\n`);

    // 7. Analisar passos individuais
    console.log('🔍 ANÁLISE DOS PASSOS:');
    if (execution.steps && execution.steps.length > 0) {
      execution.steps.forEach((step, index) => {
        const icon = step.status === 'success' ? '✅' : '❌';
        console.log(`${icon} Passo ${index + 1}: ${step.stepId}`);
        console.log(`   Status: ${step.status}`);
        console.log(`   Duração: ${step.duration}ms`);
        if (step.error) {
          console.log(`   Erro: ${step.error}`);
        }
      });
    }

    // 8. Verificar se o screenshot foi salvo
    console.log('\n📸 VERIFICAÇÃO DE SCREENSHOTS:');
    const expectedFiles = [
      `${screenshotName}.png`,
      `${screenshotName}_1.png`,
      `${screenshotName}_01.png`
    ];

    let screenshotFound = false;
    for (const fileName of expectedFiles) {
      const filePath = path.join(screenshotDir, fileName);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✅ Screenshot encontrado: ${fileName}`);
        console.log(`   Caminho: ${filePath}`);
        console.log(`   Tamanho: ${stats.size} bytes`);
        console.log(`   Criado em: ${stats.birthtime}`);
        screenshotFound = true;
        break;
      }
    }

    if (!screenshotFound) {
      console.log('❌ Nenhum screenshot encontrado');
      console.log('📁 Conteúdo do diretório de screenshots:');
      try {
        const files = fs.readdirSync(screenshotDir);
        if (files.length === 0) {
          console.log('   (diretório vazio)');
        } else {
          files.forEach(file => console.log(`   - ${file}`));
        }
      } catch (error) {
        console.log(`   Erro ao ler diretório: ${error.message}`);
      }
    }

    // 9. Analisar timeouts
    console.log('\n⏱️ ANÁLISE DE TIMEOUTS:');
    if (execution.steps) {
      execution.steps.forEach((step, index) => {
        const expectedTimeout = testFlowData.steps[index]?.timeout;
        console.log(`Passo ${index + 1}: ${step.stepId}`);
        console.log(`   Timeout configurado: ${expectedTimeout}ms`);
        console.log(`   Duração real: ${step.duration}ms`);
        
        if (expectedTimeout && step.duration > expectedTimeout) {
          console.log(`   ⚠️ ATENÇÃO: Duração excedeu timeout configurado!`);
        } else {
          console.log(`   ✅ Dentro do timeout esperado`);
        }
      });
    }

    // 10. Limpar fluxo de teste
    console.log('\n🧹 Limpando fluxo de teste...');
    await fetch(`http://localhost:3001/test-flows/${flowId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // 11. Relatório final
    console.log('\n🎯 CONCLUSÕES:');
    console.log('==============');
    console.log(`✅ Teste executado com sucesso`);
    console.log(`📊 Status da execução: ${execution.status}`);
    console.log(`📸 Screenshots: ${screenshotFound ? 'FUNCIONANDO' : 'PROBLEMA'}`);
    console.log(`⏱️ Timeouts: ${execution.steps ? 'CONFIGURADOS' : 'VERIFICAÇÃO NECESSÁRIA'}`);

  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
    console.error(error.stack);
  }
}

testScreenshotAndTimeout(); 