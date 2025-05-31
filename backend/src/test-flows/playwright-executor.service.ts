import { Injectable, Logger } from '@nestjs/common';
import { MCPManagerService } from '../mcp/mcp-manager.service';

export interface TestStepConfig {
  id: string;
  name: string;
  type: string;
  config: any;
  timeout?: number;
  continueOnError?: boolean;
}

@Injectable()
export class PlaywrightExecutorService {
  private readonly logger = new Logger(PlaywrightExecutorService.name);
  
  constructor(private readonly mcpManager: MCPManagerService) {}

  /**
   * Executa um passo de teste usando Playwright via MCP
   */
  async executeStep(step: TestStepConfig): Promise<{
    success: boolean;
    result?: any;
    error?: string;
    duration: number;
  }> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`🎬 Executando passo real: ${step.name} (${step.type}) com timeout: ${step.timeout || 'padrão'}ms`);
      
      let result;
      
      switch (step.type) {
        case 'navigate':
          result = await this.executeNavigate(step.config, step.timeout);
          break;
          
        case 'click':
          result = await this.executeClick(step.config, step.timeout);
          break;
          
        case 'fill':
          result = await this.executeFill(step.config, step.timeout);
          break;
          
        case 'screenshot':
          result = await this.executeScreenshot(step.config, step.timeout);
          break;
          
        case 'wait':
          result = await this.executeWait(step.config);
          break;
          
        case 'assert':
          result = await this.executeAssert(step.config, step.timeout);
          break;
          
        case 'extract':
          result = await this.executeExtract(step.config, step.timeout);
          break;
          
        default:
          throw new Error(`Tipo de passo não suportado: ${step.type}`);
      }
      
      const duration = Date.now() - startTime;
      this.logger.log(`✅ Passo ${step.name} executado com sucesso em ${duration}ms`);
      
      return {
        success: true,
        result,
        duration
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Erro no passo ${step.name}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        duration
      };
    }
  }

  /**
   * Executa navegação para uma URL
   */
  private async executeNavigate(config: { url: string; waitUntil?: string }, timeout?: number): Promise<any> {
    if (!this.mcpManager.isServerRunning('playwright')) {
      throw new Error('Servidor Playwright MCP não está rodando');
    }

    const navigationTimeout = timeout || 30000;
    this.logger.log(`🌐 Navegando para ${config.url} (timeout: ${navigationTimeout}ms)`);

    return await this.mcpManager.callTool('playwright', 'playwright_navigate', {
      url: config.url,
      waitUntil: config.waitUntil || 'domcontentloaded',
      timeout: navigationTimeout
    });
  }

  /**
   * Executa clique em elemento
   */
  private async executeClick(config: { selector: string }, timeout?: number): Promise<any> {
    if (!this.mcpManager.isServerRunning('playwright')) {
      throw new Error('Servidor Playwright MCP não está rodando');
    }

    this.logger.log(`👆 Clicando em ${config.selector} ${timeout ? `(timeout: ${timeout}ms)` : ''}`);

    // Note: O MCP playwright_click não aceita timeout diretamente
    // O timeout seria tratado pelo próprio Playwright internamente
    return await this.mcpManager.callTool('playwright', 'playwright_click', {
      selector: config.selector
    });
  }

  /**
   * Executa preenchimento de campo
   */
  private async executeFill(config: { selector: string; value: string }, timeout?: number): Promise<any> {
    if (!this.mcpManager.isServerRunning('playwright')) {
      throw new Error('Servidor Playwright MCP não está rodando');
    }

    this.logger.log(`✏️ Preenchendo ${config.selector} com "${config.value}" ${timeout ? `(timeout: ${timeout}ms)` : ''}`);

    return await this.mcpManager.callTool('playwright', 'playwright_fill', {
      selector: config.selector,
      value: config.value
    });
  }

  /**
   * Executa captura de screenshot
   */
  private async executeScreenshot(config: { name: string; fullPage?: boolean; savePath?: string }, timeout?: number): Promise<any> {
    if (!this.mcpManager.isServerRunning('playwright')) {
      throw new Error('Servidor Playwright MCP não está rodando');
    }

    this.logger.log(`📸 Capturando screenshot "${config.name}" ${timeout ? `(timeout: ${timeout}ms)` : ''}`);

    // Usar parâmetros básicos do MCP Playwright
    const result = await this.mcpManager.callTool('playwright', 'playwright_screenshot', {
      name: config.name,
      fullPage: config.fullPage || false,
      savePng: true,
      storeBase64: false
    });

    this.logger.log(`📸 Screenshot - Resultado COMPLETO:`, JSON.stringify(result, null, 2));
    this.logger.log(`📸 Screenshot - Tipo do resultado: ${typeof result}`);
    this.logger.log(`📸 Screenshot - Keys do resultado:`, Object.keys(result || {}));
    
    // Verificar se há informação sobre onde foi salvo
    if (result && typeof result === 'object') {
      if (result.path) {
        this.logger.log(`📁 Arquivo possivelmente salvo em: ${result.path}`);
      }
      if (result.filePath) {
        this.logger.log(`📁 Arquivo possivelmente salvo em: ${result.filePath}`);
      }
      if (result.location) {
        this.logger.log(`📁 Arquivo possivelmente salvo em: ${result.location}`);
      }
      if (result.saved) {
        this.logger.log(`💾 Status de salvamento: ${result.saved}`);
      }
    }
    
    return result;
  }

  /**
   * Executa espera
   */
  private async executeWait(config: { duration: number }): Promise<any> {
    this.logger.log(`⏳ Aguardando ${config.duration}ms`);
    await new Promise(resolve => setTimeout(resolve, config.duration));
    return { waited: config.duration };
  }

  /**
   * Executa asserção (verificação)
   */
  private async executeAssert(config: { 
    type: 'text' | 'element' | 'url';
    selector?: string;
    expected: string;
  }, timeout?: number): Promise<any> {
    if (!this.mcpManager.isServerRunning('playwright')) {
      throw new Error('Servidor Playwright MCP não está rodando');
    }

    switch (config.type) {
      case 'text':
        // Verificar se elemento contém texto esperado
        const textContentResult = await this.mcpManager.callTool('playwright', 'playwright_evaluate', {
          script: `document.querySelector('${config.selector}')?.textContent || ''`
        });
        
        const textContent = textContentResult?.result || textContentResult;
        
        if (!textContent.includes(config.expected)) {
          throw new Error(`Texto esperado "${config.expected}" não encontrado. Encontrado: "${textContent}"`);
        }
        return { assertion: 'text', passed: true, expected: config.expected, actual: textContent };
        
      case 'element':
        // Verificar se elemento existe
        const elementExistsResult = await this.mcpManager.callTool('playwright', 'playwright_evaluate', {
          script: `!!document.querySelector('${config.selector}')`
        });
        
        const elementExists = elementExistsResult?.result || elementExistsResult;
        
        if (!elementExists) {
          throw new Error(`Elemento "${config.selector}" não encontrado`);
        }
        return { assertion: 'element', passed: true, selector: config.selector };
        
      case 'url':
        // Verificar URL atual
        const currentUrlResult = await this.mcpManager.callTool('playwright', 'playwright_evaluate', {
          script: 'window.location.href'
        });
        
        // Extrair a URL do resultado MCP (pode vir em currentUrlResult.result ou direto)
        const currentUrl = currentUrlResult?.result || currentUrlResult;
        const urlString = typeof currentUrl === 'string' ? currentUrl : String(currentUrl);
        
        if (!urlString.includes(config.expected)) {
          throw new Error(`URL esperada "${config.expected}" não corresponde. URL atual: "${urlString}"`);
        }
        return { assertion: 'url', passed: true, expected: config.expected, actual: urlString };
        
      default:
        throw new Error(`Tipo de asserção não suportado: ${config.type}`);
    }
  }

  /**
   * Executa extração de dados
   */
  private async executeExtract(config: { 
    selector: string;
    attribute?: string;
    property?: 'text' | 'html' | 'value';
  }, timeout?: number): Promise<any> {
    if (!this.mcpManager.isServerRunning('playwright')) {
      throw new Error('Servidor Playwright MCP não está rodando');
    }

    let script: string;
    
    if (config.attribute) {
      script = `document.querySelector('${config.selector}')?.getAttribute('${config.attribute}') || null`;
    } else if (config.property) {
      switch (config.property) {
        case 'text':
          script = `document.querySelector('${config.selector}')?.textContent || null`;
          break;
        case 'html':
          script = `document.querySelector('${config.selector}')?.innerHTML || null`;
          break;
        case 'value':
          script = `document.querySelector('${config.selector}')?.value || null`;
          break;
        default:
          throw new Error(`Propriedade não suportada: ${config.property}`);
      }
    } else {
      // Padrão: extrair texto
      script = `document.querySelector('${config.selector}')?.textContent || null`;
    }

    const extractedDataResult = await this.mcpManager.callTool('playwright', 'playwright_evaluate', {
      script
    });

    const extractedData = extractedDataResult?.result || extractedDataResult;

    return {
      selector: config.selector,
      attribute: config.attribute,
      property: config.property,
      extractedData
    };
  }

  /**
   * Verifica se o Playwright está disponível
   */
  async isPlaywrightAvailable(): Promise<boolean> {
    return this.mcpManager.isServerRunning('playwright');
  }

  /**
   * Inicializa uma nova sessão do browser (se necessário)
   */
  async initializeBrowser(): Promise<void> {
    if (!this.mcpManager.isServerRunning('playwright')) {
      throw new Error('Servidor Playwright MCP não está rodando');
    }

    // O MCP Playwright gerencia o browser automaticamente
    // Aqui podemos fazer configurações específicas se necessário
    this.logger.log('🌐 Browser inicializado via MCP Playwright');
  }

  /**
   * Fecha o browser (se necessário)
   */
  async closeBrowser(): Promise<void> {
    if (this.mcpManager.isServerRunning('playwright')) {
      try {
        await this.mcpManager.callTool('playwright', 'playwright_close', {
          random_string: 'cleanup'
        });
        this.logger.log('🔒 Browser fechado');
      } catch (error) {
        this.logger.warn('Erro ao fechar browser:', error.message);
      }
    }
  }
} 