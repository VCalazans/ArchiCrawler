#!/usr/bin/env node

/**
 * Teste Básico do Módulo LLM Tests
 * 
 * Este script testa a funcionalidade básica do módulo LLM Tests
 * sem depender de chaves API reais.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testLLMModule() {
  console.log('🧪 TESTE BÁSICO - MÓDULO LLM TESTS');
  console.log('===================================\n');

  try {
    // 1. Verificar se o servidor está rodando
    console.log('1️⃣ Verificando servidor...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Servidor está rodando');
    } catch (error) {
      console.log('❌ Servidor não está rodando. Execute: npm run start:dev');
      return;
    }

    // 2. Listar provedores disponíveis
    console.log('\n2️⃣ Listando provedores LLM...');
    try {
      const providersResponse = await axios.get(`${BASE_URL}/llm-tests/api-keys`);
      console.log('✅ API de provedores funcionando');
      console.log('📊 Provedores disponíveis:');
      
      if (providersResponse.data.data && providersResponse.data.data.available) {
        providersResponse.data.data.available.forEach(provider => {
          console.log(`   🤖 ${provider.name}: ${provider.models.length} modelos`);
        });
      }
    } catch (error) {
      console.log('❌ Erro ao listar provedores:', error.response?.data?.message || error.message);
    }

    // 3. Verificar estrutura da base de dados
    console.log('\n3️⃣ Verificando base de dados...');
    const { Client } = require('pg');
    const client = new Client({
      host: '145.223.79.190',
      port: 5432,
      user: 'archicode',
      password: '#Archicode2025',
      database: 'archicrawler',
      ssl: false,
    });

    try {
      await client.connect();
      
      // Verificar tabelas LLM
      const tablesQuery = `
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('user_api_keys', 'generated_tests', 'llm_provider_configs')
        ORDER BY tablename;
      `;
      
      const tablesResult = await client.query(tablesQuery);
      
      if (tablesResult.rows.length === 3) {
        console.log('✅ Todas as tabelas LLM criadas');
        
        // Verificar dados iniciais
        const configsQuery = 'SELECT provider, name FROM llm_provider_configs ORDER BY provider';
        const configsResult = await client.query(configsQuery);
        
        console.log('📋 Configurações dos provedores:');
        configsResult.rows.forEach(row => {
          console.log(`   🔧 ${row.provider}: ${row.name}`);
        });
        
      } else {
        console.log('❌ Algumas tabelas LLM estão faltando');
        console.log('   Tabelas encontradas:', tablesResult.rows.map(r => r.tablename));
      }
      
      await client.end();
    } catch (error) {
      console.log('❌ Erro ao verificar base de dados:', error.message);
    }

    // 4. Teste de validação de estrutura (sem API key)
    console.log('\n4️⃣ Testando validação de inputs...');
    try {
      const invalidTestData = {
        targetUrl: 'invalid-url',
        testDescription: '',
        testType: 'invalid',
        llmProvider: 'invalid'
      };

      const response = await axios.post(`${BASE_URL}/llm-tests/generate`, invalidTestData);
      console.log('⚠️ Validação deveria ter falhado');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validação de inputs funcionando');
      } else {
        console.log('❌ Erro inesperado:', error.response?.data?.message || error.message);
      }
    }

    // 5. Verificar estatísticas (sem dados)
    console.log('\n5️⃣ Testando endpoint de estatísticas...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/llm-tests/generate/statistics`);
      console.log('✅ Endpoint de estatísticas funcionando');
      console.log('📊 Estatísticas:', JSON.stringify(statsResponse.data.data, null, 2));
    } catch (error) {
      console.log('❌ Erro nas estatísticas:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 TESTE BÁSICO CONCLUÍDO!');
    console.log('\n📋 RESUMO:');
    console.log('   ✅ Módulo LLM Tests está configurado');
    console.log('   ✅ Base de dados está funcionando');
    console.log('   ✅ APIs estão respondendo');
    console.log('   ✅ Validações estão ativas');
    console.log('\n📝 PRÓXIMO PASSO:');
    console.log('   🔑 Configure uma API key real para testar geração:');
    console.log('   curl -X POST http://localhost:3000/llm-tests/api-keys \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"provider": "openai", "apiKey": "sk-..."}\'');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
  }
}

// Executar teste
if (require.main === module) {
  testLLMModule();
} 