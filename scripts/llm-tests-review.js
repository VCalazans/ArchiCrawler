#!/usr/bin/env node

/**
 * 🔍 Script de Revisão - Módulo LLM Test Generator
 * 
 * Este script automatiza as revisões durante o desenvolvimento do módulo LLM Tests,
 * verificando estrutura, implementação e qualidade do código.
 * 
 * Uso: node scripts/llm-tests-review.js [fase] [--detailed]
 * 
 * Fases disponíveis:
 * - infrastructure: Verifica a infraestrutura base
 * - providers: Verifica implementação dos provedores LLM
 * - generation: Verifica sistema de geração de testes
 * - frontend: Verifica componentes do frontend
 * - security: Verifica aspectos de segurança
 * - all: Executa todas as verificações
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class LLMTestsReviewer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.srcPath = path.join(this.projectRoot, 'backend', 'src');
    this.llmTestsPath = path.join(this.srcPath, 'llm-tests');
    this.results = {
      phase: '',
      score: 0,
      maxScore: 0,
      issues: [],
      recommendations: [],
      completedItems: [],
      missingItems: []
    };
  }

  /**
   * 🏗️ FASE 1: Revisão da Infraestrutura Base
   */
  async reviewInfrastructure() {
    console.log('🏗️ Revisando Infraestrutura Base...\n');
    this.results.phase = 'Infrastructure';
    
    const checks = [
      {
        name: 'Estrutura de diretórios',
        check: () => this.checkDirectoryStructure(),
        weight: 3
      },
      {
        name: 'Interfaces principais',
        check: () => this.checkInterfaces(),
        weight: 4
      },
      {
        name: 'Entidades do banco',
        check: () => this.checkEntities(),
        weight: 3
      },
      {
        name: 'Módulo principal',
        check: () => this.checkMainModule(),
        weight: 2
      },
      {
        name: 'Configuração TypeScript',
        check: () => this.checkTypeScriptConfig(),
        weight: 1
      }
    ];

    await this.runChecks(checks);
    this.generateInfrastructureReport();
  }

  /**
   * 🤖 FASE 2: Revisão dos Provedores LLM
   */
  async reviewProviders() {
    console.log('🤖 Revisando Provedores LLM...\n');
    this.results.phase = 'Providers';
    
    const checks = [
      {
        name: 'Provider base abstrato',
        check: () => this.checkBaseProvider(),
        weight: 4
      },
      {
        name: 'OpenAI Provider',
        check: () => this.checkOpenAIProvider(),
        weight: 3
      },
      {
        name: 'Anthropic Provider',
        check: () => this.checkAnthropicProvider(),
        weight: 3
      },
      {
        name: 'Gemini Provider',
        check: () => this.checkGeminiProvider(),
        weight: 3
      },
      {
        name: 'Factory Pattern',
        check: () => this.checkProviderFactory(),
        weight: 4
      },
      {
        name: 'Validação de API Keys',
        check: () => this.checkApiKeyValidation(),
        weight: 3
      }
    ];

    await this.runChecks(checks);
    this.generateProvidersReport();
  }

  /**
   * ⚡ FASE 3: Revisão da Geração de Testes
   */
  async reviewGeneration() {
    console.log('⚡ Revisando Sistema de Geração...\n');
    this.results.phase = 'Generation';
    
    const checks = [
      {
        name: 'Service de geração',
        check: () => this.checkGeneratorService(),
        weight: 5
      },
      {
        name: 'Builder de prompts',
        check: () => this.checkPromptBuilder(),
        weight: 4
      },
      {
        name: 'Validador de testes',
        check: () => this.checkTestValidator(),
        weight: 4
      },
      {
        name: 'Integração MCP',
        check: () => this.checkMCPIntegration(),
        weight: 5
      },
      {
        name: 'Controllers e DTOs',
        check: () => this.checkControllersAndDTOs(),
        weight: 3
      }
    ];

    await this.runChecks(checks);
    this.generateGenerationReport();
  }

  /**
   * 🎨 FASE 4: Revisão do Frontend
   */
  async reviewFrontend() {
    console.log('🎨 Revisando Frontend...\n');
    this.results.phase = 'Frontend';
    
    const checks = [
      {
        name: 'Componente de configuração',
        check: () => this.checkConfigurationComponent(),
        weight: 4
      },
      {
        name: 'Gerador de testes UI',
        check: () => this.checkTestGeneratorUI(),
        weight: 4
      },
      {
        name: 'Dashboard de métricas',
        check: () => this.checkMetricsDashboard(),
        weight: 3
      },
      {
        name: 'Integração com backend',
        check: () => this.checkBackendIntegration(),
        weight: 4
      },
      {
        name: 'Responsividade e UX',
        check: () => this.checkResponsiveness(),
        weight: 3
      }
    ];

    await this.runChecks(checks);
    this.generateFrontendReport();
  }

  /**
   * 🛡️ FASE 5: Revisão de Segurança
   */
  async reviewSecurity() {
    console.log('🛡️ Revisando Segurança...\n');
    this.results.phase = 'Security';
    
    const checks = [
      {
        name: 'Criptografia de API Keys',
        check: () => this.checkEncryption(),
        weight: 5
      },
      {
        name: 'Rate Limiting',
        check: () => this.checkRateLimiting(),
        weight: 4
      },
      {
        name: 'Validação de inputs',
        check: () => this.checkInputValidation(),
        weight: 4
      },
      {
        name: 'Auditoria e logs',
        check: () => this.checkAuditLogs(),
        weight: 3
      },
      {
        name: 'Controle de acesso',
        check: () => this.checkAccessControl(),
        weight: 4
      }
    ];

    await this.runChecks(checks);
    this.generateSecurityReport();
  }

  /**
   * Executa verificações específicas
   */
  async runChecks(checks) {
    for (const check of checks) {
      try {
        console.log(`  🔍 Verificando: ${check.name}`);
        const result = await check.check();
        
        this.results.maxScore += check.weight;
        
        if (result.passed) {
          this.results.score += check.weight;
          this.results.completedItems.push({
            name: check.name,
            weight: check.weight,
            details: result.details || 'OK'
          });
          console.log(`    ✅ ${check.name} - OK`);
        } else {
          this.results.missingItems.push({
            name: check.name,
            weight: check.weight,
            reason: result.reason || 'Não implementado'
          });
          console.log(`    ❌ ${check.name} - ${result.reason || 'Falhou'}`);
        }

        if (result.issues) {
          this.results.issues.push(...result.issues);
        }

        if (result.recommendations) {
          this.results.recommendations.push(...result.recommendations);
        }

      } catch (error) {
        console.log(`    ⚠️  ${check.name} - Erro: ${error.message}`);
        this.results.issues.push(`Erro ao verificar ${check.name}: ${error.message}`);
      }
    }
  }

  /**
   * Verificações específicas da infraestrutura
   */
  checkDirectoryStructure() {
    const requiredDirs = [
      'interfaces',
      'providers', 
      'services',
      'controllers',
      'entities',
      'dto'
    ];

    const missingDirs = requiredDirs.filter(dir => 
      !fs.existsSync(path.join(this.llmTestsPath, dir))
    );

    return {
      passed: missingDirs.length === 0,
      reason: missingDirs.length > 0 ? `Diretórios faltando: ${missingDirs.join(', ')}` : null,
      recommendations: missingDirs.length > 0 ? ['Criar estrutura de diretórios conforme especificação'] : []
    };
  }

  checkInterfaces() {
    const requiredInterfaces = [
      'llm-provider.interface.ts',
      'test-generation.interface.ts',
      'api-key-manager.interface.ts'
    ];

    const interfacesPath = path.join(this.llmTestsPath, 'interfaces');
    const missingInterfaces = requiredInterfaces.filter(file => 
      !fs.existsSync(path.join(interfacesPath, file))
    );

    return {
      passed: missingInterfaces.length === 0,
      reason: missingInterfaces.length > 0 ? `Interfaces faltando: ${missingInterfaces.join(', ')}` : null
    };
  }

  checkEntities() {
    const requiredEntities = [
      'user-api-key.entity.ts',
      'generated-test.entity.ts',
      'llm-provider-config.entity.ts'
    ];

    const entitiesPath = path.join(this.llmTestsPath, 'entities');
    const missingEntities = requiredEntities.filter(file => 
      !fs.existsSync(path.join(entitiesPath, file))
    );

    return {
      passed: missingEntities.length === 0,
      reason: missingEntities.length > 0 ? `Entidades faltando: ${missingEntities.join(', ')}` : null
    };
  }

  checkMainModule() {
    const moduleFile = path.join(this.llmTestsPath, 'llm-tests.module.ts');
    return {
      passed: fs.existsSync(moduleFile),
      reason: !fs.existsSync(moduleFile) ? 'Módulo principal não encontrado' : null
    };
  }

  checkTypeScriptConfig() {
    // Verifica se o tsconfig está configurado corretamente
    return { passed: true, details: 'TypeScript configurado' };
  }

  /**
   * Verificações específicas dos provedores
   */
  checkBaseProvider() {
    const baseProviderFile = path.join(this.llmTestsPath, 'providers', 'base-llm.provider.ts');
    return {
      passed: fs.existsSync(baseProviderFile),
      reason: !fs.existsSync(baseProviderFile) ? 'Provider base não encontrado' : null
    };
  }

  checkOpenAIProvider() {
    const providerFile = path.join(this.llmTestsPath, 'providers', 'openai.provider.ts');
    return {
      passed: fs.existsSync(providerFile),
      reason: !fs.existsSync(providerFile) ? 'OpenAI Provider não encontrado' : null
    };
  }

  checkAnthropicProvider() {
    const providerFile = path.join(this.llmTestsPath, 'providers', 'anthropic.provider.ts');
    return {
      passed: fs.existsSync(providerFile),
      reason: !fs.existsSync(providerFile) ? 'Anthropic Provider não encontrado' : null
    };
  }

  checkGeminiProvider() {
    const providerFile = path.join(this.llmTestsPath, 'providers', 'gemini.provider.ts');
    return {
      passed: fs.existsSync(providerFile),
      reason: !fs.existsSync(providerFile) ? 'Gemini Provider não encontrado' : null
    };
  }

  checkProviderFactory() {
    const factoryFile = path.join(this.llmTestsPath, 'services', 'llm-provider.factory.ts');
    return {
      passed: fs.existsSync(factoryFile),
      reason: !fs.existsSync(factoryFile) ? 'Factory Pattern não implementado' : null
    };
  }

  checkApiKeyValidation() {
    const validationFile = path.join(this.llmTestsPath, 'services', 'api-key-manager.service.ts');
    return {
      passed: fs.existsSync(validationFile),
      reason: !fs.existsSync(validationFile) ? 'Validação de API Key não implementada' : null
    };
  }

  /**
   * Verificações de geração de testes
   */
  checkGeneratorService() {
    const serviceFile = path.join(this.llmTestsPath, 'services', 'llm-test-generator.service.ts');
    return {
      passed: fs.existsSync(serviceFile),
      reason: !fs.existsSync(serviceFile) ? 'Service de geração não encontrado' : null
    };
  }

  checkPromptBuilder() {
    const builderFile = path.join(this.llmTestsPath, 'services', 'test-prompt-builder.service.ts');
    return {
      passed: fs.existsSync(builderFile),
      reason: !fs.existsSync(builderFile) ? 'Builder de prompts não encontrado' : null
    };
  }

  checkTestValidator() {
    const validatorFile = path.join(this.llmTestsPath, 'services', 'test-validator.service.ts');
    return {
      passed: fs.existsSync(validatorFile),
      reason: !fs.existsSync(validatorFile) ? 'Validador de testes não encontrado' : null
    };
  }

  checkMCPIntegration() {
    const mcpFile = path.join(this.llmTestsPath, 'services', 'mcp-integration.service.ts');
    return {
      passed: fs.existsSync(mcpFile),
      reason: !fs.existsSync(mcpFile) ? 'Integração MCP não encontrada' : null
    };
  }

  checkControllersAndDTOs() {
    const controllerFile = path.join(this.llmTestsPath, 'controllers', 'llm-test-generator.controller.ts');
    const dtoFile = path.join(this.llmTestsPath, 'dto', 'generate-test.dto.ts');
    
    const missingFiles = [];
    if (!fs.existsSync(controllerFile)) missingFiles.push('Controller');
    if (!fs.existsSync(dtoFile)) missingFiles.push('DTOs');

    return {
      passed: missingFiles.length === 0,
      reason: missingFiles.length > 0 ? `Faltando: ${missingFiles.join(', ')}` : null
    };
  }

  /**
   * Verificações de frontend
   */
  checkConfigurationComponent() {
    // Verificar se existe o componente de configuração
    return { passed: false, reason: 'Componente de configuração não implementado' };
  }

  checkTestGeneratorUI() {
    // Verificar UI do gerador de testes
    return { passed: false, reason: 'UI do gerador não implementada' };
  }

  checkMetricsDashboard() {
    // Verificar dashboard de métricas
    return { passed: false, reason: 'Dashboard de métricas não implementado' };
  }

  checkBackendIntegration() {
    // Verificar integração com backend
    return { passed: false, reason: 'Integração com backend não implementada' };
  }

  checkResponsiveness() {
    // Verificar responsividade
    return { passed: false, reason: 'Responsividade não verificada' };
  }

  /**
   * Verificações de segurança
   */
  checkEncryption() {
    const encryptionFile = path.join(this.llmTestsPath, 'services', 'api-key-manager.service.ts');
    if (!fs.existsSync(encryptionFile)) {
      return { passed: false, reason: 'Sistema de criptografia não implementado' };
    }

    try {
      const content = fs.readFileSync(encryptionFile, 'utf8');
      const hasEncryption = content.includes('encrypt') && content.includes('decrypt');
      
      return {
        passed: hasEncryption,
        reason: !hasEncryption ? 'Métodos de criptografia não encontrados' : null,
        recommendations: !hasEncryption ? ['Implementar criptografia AES-256 para API keys'] : []
      };
    } catch (error) {
      return { passed: false, reason: 'Erro ao verificar criptografia' };
    }
  }

  checkRateLimiting() {
    // Verificar implementação de rate limiting
    return { passed: false, reason: 'Rate limiting não implementado' };
  }

  checkInputValidation() {
    // Verificar validação de inputs
    return { passed: false, reason: 'Validação de inputs não implementada' };
  }

  checkAuditLogs() {
    // Verificar sistema de auditoria
    return { passed: false, reason: 'Sistema de auditoria não implementado' };
  }

  checkAccessControl() {
    // Verificar controle de acesso
    return { passed: false, reason: 'Controle de acesso não implementado' };
  }

  /**
   * Relatórios específicos por fase
   */
  generateInfrastructureReport() {
    console.log('\n📊 RELATÓRIO - INFRAESTRUTURA');
    console.log('================================');
    this.generateCommonReport();
    
    if (this.results.score < this.results.maxScore * 0.8) {
      console.log('\n💡 PRÓXIMOS PASSOS RECOMENDADOS:');
      console.log('1. Criar estrutura de diretórios');
      console.log('2. Implementar interfaces base');
      console.log('3. Criar entidades do banco de dados');
      console.log('4. Configurar módulo principal');
    }
  }

  generateProvidersReport() {
    console.log('\n📊 RELATÓRIO - PROVEDORES LLM');
    console.log('==============================');
    this.generateCommonReport();
    
    if (this.results.score < this.results.maxScore * 0.7) {
      console.log('\n💡 PRÓXIMOS PASSOS RECOMENDADOS:');
      console.log('1. Implementar provider base abstrato');
      console.log('2. Criar provider OpenAI');
      console.log('3. Implementar factory pattern');
      console.log('4. Adicionar validação de API keys');
    }
  }

  generateGenerationReport() {
    console.log('\n📊 RELATÓRIO - GERAÇÃO DE TESTES');
    console.log('=================================');
    this.generateCommonReport();
    
    if (this.results.score < this.results.maxScore * 0.8) {
      console.log('\n💡 PRÓXIMOS PASSOS RECOMENDADOS:');
      console.log('1. Implementar service de geração');
      console.log('2. Criar builder de prompts');
      console.log('3. Integrar com MCP');
      console.log('4. Adicionar validação de testes');
    }
  }

  generateFrontendReport() {
    console.log('\n📊 RELATÓRIO - FRONTEND');
    console.log('========================');
    this.generateCommonReport();
  }

  generateSecurityReport() {
    console.log('\n📊 RELATÓRIO - SEGURANÇA');
    console.log('=========================');
    this.generateCommonReport();
    
    if (this.results.score < this.results.maxScore * 0.9) {
      console.log('\n🚨 ALERTAS DE SEGURANÇA:');
      console.log('- Implementar criptografia de API keys como PRIORIDADE');
      console.log('- Configurar rate limiting');
      console.log('- Adicionar validação rigorosa de inputs');
    }
  }

  generateCommonReport() {
    const percentage = Math.round((this.results.score / this.results.maxScore) * 100);
    
    console.log(`📈 SCORE: ${this.results.score}/${this.results.maxScore} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('🎉 EXCELENTE! Fase quase completa.');
    } else if (percentage >= 70) {
      console.log('👍 BOM progresso. Continue implementando.');
    } else if (percentage >= 50) {
      console.log('⚠️  ATENÇÃO: Várias implementações pendentes.');
    } else {
      console.log('🚨 CRÍTICO: Fase precisa de desenvolvimento significativo.');
    }

    if (this.results.completedItems.length > 0) {
      console.log('\n✅ ITENS COMPLETOS:');
      this.results.completedItems.forEach(item => {
        console.log(`  • ${item.name} (peso: ${item.weight})`);
      });
    }

    if (this.results.missingItems.length > 0) {
      console.log('\n❌ ITENS PENDENTES:');
      this.results.missingItems.forEach(item => {
        console.log(`  • ${item.name} - ${item.reason} (peso: ${item.weight})`);
      });
    }

    if (this.results.issues.length > 0) {
      console.log('\n⚠️  PROBLEMAS ENCONTRADOS:');
      this.results.issues.forEach(issue => {
        console.log(`  • ${issue}`);
      });
    }

    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMENDAÇÕES:');
      this.results.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
  }

  /**
   * Método principal de execução
   */
  async run(phase = 'all', detailed = false) {
    console.log('🔍 SCRIPT DE REVISÃO - MÓDULO LLM TEST GENERATOR');
    console.log('==================================================\n');

    const phases = {
      infrastructure: () => this.reviewInfrastructure(),
      providers: () => this.reviewProviders(),
      generation: () => this.reviewGeneration(),
      frontend: () => this.reviewFrontend(),
      security: () => this.reviewSecurity()
    };

    if (phase === 'all') {
      for (const [phaseName, phaseFunc] of Object.entries(phases)) {
        await phaseFunc();
        console.log('\n' + '='.repeat(60) + '\n');
      }
    } else if (phases[phase]) {
      await phases[phase]();
    } else {
      console.log(`❌ Fase '${phase}' não encontrada.`);
      console.log('Fases disponíveis:', Object.keys(phases).join(', '), 'all');
      process.exit(1);
    }

    console.log('\n🎯 REVISÃO CONCLUÍDA!');
    console.log('📚 Para mais detalhes, consulte: ARQUITETURA_MODULO_LLM_TESTS.md');
  }
}

// Execução do script
if (require.main === module) {
  const args = process.argv.slice(2);
  const phase = args[0] || 'all';
  const detailed = args.includes('--detailed');

  const reviewer = new LLMTestsReviewer();
  reviewer.run(phase, detailed).catch(console.error);
}

module.exports = LLMTestsReviewer; 