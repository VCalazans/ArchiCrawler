const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'archicrawler'
});

async function debugTestFlows() {
  try {
    console.log('🔍 Investigando Test Flows no banco...\n');

    // 1. Verificar fluxos existentes
    const flowsResult = await pool.query(`
      SELECT id, name, description, steps, status, is_active, created_at 
      FROM test_flows 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('📋 FLUXOS DE TESTE:');
    console.log('================');
    flowsResult.rows.forEach((flow, index) => {
      console.log(`${index + 1}. ${flow.name} (${flow.id})`);
      console.log(`   Status: ${flow.status} | Ativo: ${flow.is_active}`);
      console.log(`   Passos: ${Array.isArray(flow.steps) ? flow.steps.length : 'NULL/INVALID'}`);
      
      if (Array.isArray(flow.steps) && flow.steps.length > 0) {
        console.log('   Detalhes dos passos:');
        flow.steps.forEach((step, stepIndex) => {
          console.log(`     ${stepIndex + 1}. ${step.name || 'SEM NOME'} (${step.type || 'SEM TIPO'})`);
          console.log(`        Config: ${JSON.stringify(step.config || {})}`);
        });
      } else {
        console.log('   ⚠️  NENHUM PASSO CONFIGURADO');
      }
      console.log('');
    });

    // 2. Verificar execuções recentes
    const executionsResult = await pool.query(`
      SELECT te.id, te.test_flow_id, te.status, te.total_steps, te.completed_steps, 
             te.failed_steps, te.steps, te.duration, te.created_at,
             tf.name as flow_name
      FROM test_executions te
      LEFT JOIN test_flows tf ON te.test_flow_id = tf.id
      ORDER BY te.created_at DESC 
      LIMIT 5
    `);

    console.log('\n🎬 EXECUÇÕES RECENTES:');
    console.log('====================');
    executionsResult.rows.forEach((exec, index) => {
      console.log(`${index + 1}. ${exec.flow_name} (${exec.id})`);
      console.log(`   Status: ${exec.status} | Duração: ${exec.duration}ms`);
      console.log(`   Passos: ${exec.completed_steps}/${exec.total_steps} (${exec.failed_steps} falhas)`);
      
      if (Array.isArray(exec.steps) && exec.steps.length > 0) {
        console.log('   Detalhes da execução:');
        exec.steps.forEach((step, stepIndex) => {
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

    // 3. Verificar última atualização de passos
    const lastUpdateResult = await pool.query(`
      SELECT id, name, steps, updated_at 
      FROM test_flows 
      WHERE updated_at IS NOT NULL 
      ORDER BY updated_at DESC 
      LIMIT 3
    `);

    console.log('\n🔄 ÚLTIMAS ATUALIZAÇÕES:');
    console.log('=======================');
    lastUpdateResult.rows.forEach((flow, index) => {
      console.log(`${index + 1}. ${flow.name} - Atualizado em: ${flow.updated_at}`);
      console.log(`   Passos salvos: ${Array.isArray(flow.steps) ? flow.steps.length : 'INVÁLIDO'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao debuggar:', error);
  } finally {
    pool.end();
  }
}

debugTestFlows(); 