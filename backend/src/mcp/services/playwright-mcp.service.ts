import { Injectable, Logger } from '@nestjs/common';
import { MCPManagerService } from '../mcp-manager.service';

@Injectable()
export class PlaywrightMCPService {
  private readonly logger = new Logger(PlaywrightMCPService.name);
  private readonly SERVER_NAME = 'playwright';

  constructor(private readonly mcpManager: MCPManagerService) {}

  /**
   * Garante que o servidor Playwright está rodando
   */
  private async ensurePlaywrightServerRunning(): Promise<void> {
    if (!this.mcpManager.isServerRunning(this.SERVER_NAME)) {
      this.logger.debug('Iniciando servidor Playwright MCP...');
      await this.mcpManager.startServer(this.SERVER_NAME);
    }
  }

  /**
   * Executa uma ferramenta do Playwright via MCP
   */
  private async callPlaywrightTool(toolName: string, args: any = {}): Promise<any> {
    await this.ensurePlaywrightServerRunning();
    
    try {
      const result = await this.mcpManager.callTool(this.SERVER_NAME, toolName, args);
      this.logger.debug(`Playwright ${toolName} executado:`, { args, success: true });
      return result;
    } catch (error) {
      this.logger.error(`Erro no Playwright ${toolName}:`, { args, error: error.message });
      throw error;
    }
  }

  /**
   * Navega para uma URL
   */
  async navigate(url: string, options?: { waitUntil?: string; timeout?: number }): Promise<any> {
    return this.callPlaywrightTool('browser_navigate', {
      url
    });
  }

  /**
   * Clica em um elemento
   */
  async click(selector: string, options?: { timeout?: number }): Promise<any> {
    // Para click precisamos obter snapshot primeiro para ter o 'ref'
    const snapshot = await this.callPlaywrightTool('browser_snapshot');
    
    return this.callPlaywrightTool('browser_click', {
      element: selector, // descrição humana
      ref: selector // usar selector como ref temporariamente
    });
  }

  /**
   * Preenche um campo
   */
  async fill(selector: string, value: string, options?: { timeout?: number }): Promise<any> {
    // Para type precisamos obter snapshot primeiro para ter o 'ref'
    const snapshot = await this.callPlaywrightTool('browser_snapshot');
    
    return this.callPlaywrightTool('browser_type', {
      element: selector, // descrição humana
      ref: selector, // usar selector como ref temporariamente
      text: value
    });
  }

  /**
   * Hover sobre um elemento
   */
  async hover(selector: string, options?: { timeout?: number }): Promise<any> {
    const snapshot = await this.callPlaywrightTool('browser_snapshot');
    
    return this.callPlaywrightTool('browser_hover', {
      element: selector,
      ref: selector
    });
  }

  /**
   * Seleciona uma opção
   */
  async select(selector: string, value: string, options?: { timeout?: number }): Promise<any> {
    const snapshot = await this.callPlaywrightTool('browser_snapshot');
    
    return this.callPlaywrightTool('browser_select_option', {
      element: selector,
      ref: selector,
      values: [value]
    });
  }

  /**
   * Aguarda um tempo
   */
  async wait(milliseconds: number): Promise<any> {
    return this.callPlaywrightTool('browser_wait_for', {
      time: milliseconds / 1000 // converter para segundos
    });
  }

  /**
   * Captura screenshot
   */
  async screenshot(name?: string, options?: { fullPage?: boolean }): Promise<any> {
    return this.callPlaywrightTool('browser_take_screenshot', {
      filename: name || `screenshot-${Date.now()}.png`,
      raw: false // JPEG por padrão
    });
  }

  /**
   * Pressiona uma tecla
   */
  async pressKey(key: string, selector?: string): Promise<any> {
    return this.callPlaywrightTool('browser_press_key', {
      key
    });
  }

  /**
   * Obtém texto visível da página via snapshot
   */
  async getVisibleText(): Promise<any> {
    return this.callPlaywrightTool('browser_snapshot');
  }

  /**
   * Obtém HTML da página via snapshot
   */
  async getVisibleHtml(): Promise<any> {
    return this.callPlaywrightTool('browser_snapshot');
  }

  /**
   * Vai para a página anterior
   */
  async goBack(): Promise<any> {
    return this.callPlaywrightTool('browser_navigate_back');
  }

  /**
   * Vai para a próxima página
   */
  async goForward(): Promise<any> {
    return this.callPlaywrightTool('browser_navigate_forward');
  }

  /**
   * Fecha o navegador
   */
  async close(): Promise<any> {
    return this.callPlaywrightTool('browser_close');
  }

  /**
   * Executa JavaScript na página (não disponível diretamente)
   */
  async evaluate(script: string): Promise<any> {
    // Esta funcionalidade não está disponível diretamente no MCP
    throw new Error('JavaScript evaluation não disponível via MCP Playwright');
  }

  /**
   * Drag and drop
   */
  async drag(sourceSelector: string, targetSelector: string): Promise<any> {
    const snapshot = await this.callPlaywrightTool('browser_snapshot');
    
    return this.callPlaywrightTool('browser_drag', {
      startElement: sourceSelector,
      startRef: sourceSelector,
      endElement: targetSelector,
      endRef: targetSelector
    });
  }

  /**
   * Obtém logs do console
   */
  async getConsoleLogs(options?: { type?: string; search?: string; limit?: number }): Promise<any> {
    return this.callPlaywrightTool('browser_console_messages');
  }

  /**
   * Verifica se o servidor Playwright está disponível
   */
  async checkHealth(): Promise<{ healthy: boolean; message: string }> {
    try {
      await this.ensurePlaywrightServerRunning();
      
      // Tenta listar as ferramentas disponíveis como health check
      const tools = await this.mcpManager.listTools(this.SERVER_NAME);
      
      return {
        healthy: true,
        message: `Playwright MCP ativo com ${tools.tools?.length || 0} ferramentas disponíveis`
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Playwright MCP indisponível: ${error.message}`
      };
    }
  }
} 