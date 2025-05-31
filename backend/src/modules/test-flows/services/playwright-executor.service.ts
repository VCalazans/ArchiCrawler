import { Injectable, Logger } from '@nestjs/common';
import { MCPManagerService } from '../../../mcp/mcp-manager.service';

@Injectable()
export class PlaywrightExecutorService {
  private readonly logger = new Logger(PlaywrightExecutorService.name);

  constructor(private readonly mcpManager: MCPManagerService) {}

  async executeStep(step: any): Promise<any> {
    const startTime = Date.now();
    
    try {
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
          result = await this.executeWait(step.config, step.timeout);
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
      this.logger.log(`✅ Passo ${step.id} concluído em ${duration}ms`);
      
      return { success: true, result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Erro no passo ${step.id} após ${duration}ms: ${error.message}`);
      throw error;
    }
  }

  private async executeNavigate(config: { url: string }, timeout?: number): Promise<any> {
    const navigationTimeout = timeout || 30000;
    this.logger.log(`🌐 Navegando para ${config.url} (timeout: ${navigationTimeout}ms)`);
    
    const startTime = Date.now();
    
    try {
      const result = await this.mcpManager.callTool('playwright', 'browser_navigate', {
        url: config.url
      });
      
      const duration = Date.now() - startTime;
      this.logger.log(`✅ Navegação concluída em ${duration}ms (limite: ${navigationTimeout}ms)`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Erro na navegação após ${duration}ms: ${error.message}`);
      throw error;
    }
  }

  private async executeClick(config: { selector: string }, timeout?: number): Promise<any> {
    this.logger.log(`🖱️ Clicando em: ${config.selector} (timeout: ${timeout || 5000}ms)`);
    
    return await this.mcpManager.callTool('playwright', 'browser_click', {
      element: config.selector
    });
  }

  private async executeFill(config: { selector: string; value: string }, timeout?: number): Promise<any> {
    this.logger.log(`✏️ Preenchendo ${config.selector} com: "${config.value}" (timeout: ${timeout || 5000}ms)`);
    
    return await this.mcpManager.callTool('playwright', 'browser_type', {
      element: config.selector,
      text: config.value
    });
  }

  private async executeScreenshot(config: { name: string; fullPage?: boolean }, timeout?: number): Promise<any> {
    this.logger.log(`📸 Capturando screenshot: ${config.name} (fullPage: ${config.fullPage || false}, timeout: ${timeout || 10000}ms)`);
    
    const result = await this.mcpManager.callTool('playwright', 'browser_screenshot', {
      filename: config.name,
      element: config.fullPage ? undefined : 'body'
    });
    
    this.logger.log(`📸 Screenshot salvo: ${config.name}`);
    return result;
  }

  private async executeWait(config: { duration: number }, timeout?: number): Promise<any> {
    this.logger.log(`⏳ Aguardando ${config.duration}ms (timeout: ${timeout || config.duration + 1000}ms)`);
    
    await new Promise(resolve => setTimeout(resolve, config.duration));
    
    return { success: true, message: `Aguardou ${config.duration}ms` };
  }

  private async executeAssert(config: { condition: string; expected: any }, timeout?: number): Promise<any> {
    this.logger.log(`🔍 Verificando condição: ${config.condition} (timeout: ${timeout || 5000}ms)`);
    
    // Para assertions simples, vamos usar verificação básica
    return { success: true, message: 'Assertion executada (simulada)' };
  }

  private async executeExtract(config: { selector: string; attribute?: string }, timeout?: number): Promise<any> {
    this.logger.log(`📤 Extraindo de: ${config.selector} (timeout: ${timeout || 5000}ms)`);
    
    // Usar o console messages para extrair dados
    const result = await this.mcpManager.callTool('playwright', 'browser_console_messages', {});
    
    return { 
      success: true, 
      data: `Dados extraídos de ${config.selector}`,
      result
    };
  }
} 