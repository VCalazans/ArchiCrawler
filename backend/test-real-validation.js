const fetch = require('node-fetch');

async function testRealValidation() {
  try {
    console.log('🧪 TESTE DE VALIDAÇÃO COMPLETA');
    console.log('==============================\n');

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
    
    console.log('✅ Login realizado com sucesso\n');

    // 2. Verificar status do Playwright
    console.log('🎭 Verificando status do Playwright...');
    const statusResponse = await fetch('http://localhost:3001/test-flows/playwright/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const statusData = await statusResponse.json();
    console.log(`Status: ${statusData.data.message}`);
    console.log(`Modo: ${statusData.data.executionMode}\n`);

    // 3. Executar teste completo de validação
    console.log('🚀 Iniciando teste de validação completo...');
    console.log('(Este teste vai criar um fluxo, executar e analisar os resultados)\n');
    
    const testResponse = await fetch('http://localhost:3001/test-flows/debug/test-execution', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const testData = await testResponse.json();
    
    if (!testData.success) {
      console.error('❌ Erro no teste:', testData);
      return;
    }

    // 4. Exibir relatório detalhado
    const report = testData.data;
    
    console.log('📄 RELATÓRIO DE VALIDAÇÃO');
    console.log('=========================');
    console.log(`🕒 Timestamp: ${report.timestamp}`);
    console.log(`🎭 Playwright: ${report.playwrightAvailable ? 'ATIVO' : 'INATIVO'}`);
    console.log(`⚙️  Modo de Execução: ${report.executionMode}`);
    console.log(`📊 Status Geral: ${report.summary.overallStatus}`);
    console.log(`✅ Taxa de Sucesso: ${report.summary.successRate}`);
    console.log(`🔄 Execução Funcionando: ${report.execution.working ? 'SIM' : 'NÃO'}`);
    
    console.log('\n📋 DETALHES DO FLUXO DE TESTE:');
    console.log(`Nome: ${report.testFlow.name}`);
    console.log(`ID: ${report.testFlow.id}`);
    console.log(`Passos Configurados: ${report.testFlow.stepsConfigured}`);
    
    console.log('\n🎬 DETALHES DA EXECUÇÃO:');
    console.log(`ID: ${report.execution.id}`);
    console.log(`Status: ${report.execution.status}`);
    console.log(`Passos: ${report.execution.completedSteps}/${report.execution.totalSteps}`);
    console.log(`Falhas: ${report.execution.failedSteps}`);
    console.log(`Duração: ${report.execution.duration}ms`);
    
    console.log('\n🔍 ANÁLISE DOS PASSOS:');
    report.steps.forEach((step, index) => {
      const icon = step.success ? '✅' : '❌';
      console.log(`${icon} Passo ${index + 1}: ${step.stepId}`);
      console.log(`   Status: ${step.status}`);
      console.log(`   Duração: ${step.duration}ms`);
      if (step.error) {
        console.log(`   Erro: ${step.error}`);
      }
    });
    
    console.log('\n🎯 CONCLUSÕES:');
    if (report.summary.overallStatus === 'SUCCESS') {
      console.log('✅ SISTEMA FUNCIONANDO CORRETAMENTE!');
      console.log('   - Fluxos podem ser criados com passos');
      console.log('   - Execuções são iniciadas e finalizadas');
      console.log('   - Passos são executados conforme configurado');
      console.log('   - Relatórios são gerados corretamente');
      
      if (report.playwrightAvailable) {
        console.log('   - Playwright MCP está ativo (execução real)');
      } else {
        console.log('   - Playwright MCP inativo (modo simulação)');
      }
    } else {
      console.log('❌ PROBLEMAS DETECTADOS:');
      console.log('   - Verifique os logs detalhados acima');
      console.log('   - Analise os erros nos passos individuais');
      
      if (!report.execution.working) {
        console.log('   - A execução não está funcionando corretamente');
      }
      
      if (report.summary.successRate === '0%') {
        console.log('   - Nenhum passo foi executado com sucesso');
      }
    }
    
    console.log(`\n✨ Teste finalizado: ${testData.message}`);

  } catch (error) {
    console.error('❌ Erro durante validação:', error);
  }
}

testRealValidation(); 