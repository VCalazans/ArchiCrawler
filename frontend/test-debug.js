// Teste no console do navegador para debuggar
async function debugTestFlows() {
  try {
    console.log('🔍 Debuggando Test Flows via API...\n');

    // 1. Fazer login primeiro
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
    
    console.log('✅ Login realizado com sucesso');

    // 2. Buscar dados de debug
    const debugResponse = await fetch('http://localhost:3001/test-flows/debug/data', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const debugData = await debugResponse.json();
    
    if (!debugData.success) {
      console.error('❌ Erro no debug:', debugData);
      return;
    }
    
    console.log('\n📋 FLUXOS DE TESTE:');
    console.log('================');
    debugData.data.flows.forEach((flow, index) => {
      console.log(`${index + 1}. ${flow.name} (${flow.id})`);
      console.log(`   Status: ${flow.status} | Ativo: ${flow.isActive}`);
      console.log(`   Passos: ${flow.stepsCount}`);
      
      if (flow.steps && flow.steps.length > 0) {
        console.log('   Detalhes dos passos:');
        flow.steps.forEach((step, stepIndex) => {
          console.log(`     ${stepIndex + 1}. ${step.name || 'SEM NOME'} (${step.type || 'SEM TIPO'})`);
          console.log(`        Config:`, step.config || {});
        });
      } else {
        console.log('   ⚠️  NENHUM PASSO CONFIGURADO');
      }
      console.log('');
    });

    console.log('\n🎬 EXECUÇÕES RECENTES:');
    console.log('====================');
    debugData.data.executions.forEach((exec, index) => {
      console.log(`${index + 1}. Fluxo ${exec.testFlowId}`);
      console.log(`   Status: ${exec.status} | Duração: ${exec.duration}ms`);
      console.log(`   Passos: ${exec.completedSteps}/${exec.totalSteps} (${exec.failedSteps} falhas)`);
      
      if (exec.stepsDetails && exec.stepsDetails.length > 0) {
        console.log('   Detalhes da execução:');
        exec.stepsDetails.forEach((step, stepIndex) => {
          console.log(`     ${stepIndex + 1}. ${step.stepId} - ${step.status} (${step.duration}ms)`);
          if (step.error) {
            console.log(`        ❌ Erro: ${step.error}`);
          }
        });
      } else {
        console.log('   ⚠️  NENHUM DETALHE DE EXECUÇÃO');
      }
      console.log('');
    });

    // 3. Testar um fluxo específico se existir
    if (debugData.data.flows.length > 0) {
      const firstFlow = debugData.data.flows[0];
      console.log(`\n🔍 DETALHES DO FLUXO: ${firstFlow.name}`);
      console.log('===================================');
      
      const flowResponse = await fetch(`http://localhost:3001/test-flows/${firstFlow.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const flowData = await flowResponse.json();
      console.log('Dados completos do fluxo:', flowData.data);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar automaticamente
debugTestFlows(); 