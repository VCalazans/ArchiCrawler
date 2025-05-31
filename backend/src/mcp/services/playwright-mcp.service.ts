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
    return this.callPlaywrightTool('playwright_navigate', {
      url,
      browserType: 'chromium',
      headless: false, // Para testes LLM queremos ver o que está acontecendo
      waitUntil: options?.waitUntil || 'domcontentloaded',
      timeout: options?.timeout || 30000,
      width: 1280,
      height: 720
    });
  }

  /**
   * Clica em um elemento
   */
  async click(selector: string, options?: { timeout?: number }): Promise<any> {
    return this.callPlaywrightTool('playwright_click', {
      selector,
      timeout: options?.timeout || 10000
    });
  }

  /**
   * Preenche um campo
   */
  async fill(selector: string, value: string, options?: { timeout?: number }): Promise<any> {
    return this.callPlaywrightTool('playwright_fill', {
      selector,
      value,
      timeout: options?.timeout || 10000
    });
  }

  /**
   * Hover sobre um elemento
   */
  async hover(selector: string, options?: { timeout?: number }): Promise<any> {
    return this.callPlaywrightTool('playwright_hover', {
      selector,
      timeout: options?.timeout || 10000
    });
  }

  /**
   * Seleciona uma opção
   */
  async select(selector: string, value: string, options?: { timeout?: number }): Promise<any> {
    return this.callPlaywrightTool('playwright_select', {
      selector,
      value,
      timeout: options?.timeout || 10000
    });
  }

  /**
   * Aguarda um tempo
   */
  async wait(milliseconds: number): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ waited: milliseconds });
      }, milliseconds);
    });
  }

  /**
   * Captura screenshot
   */
  async screenshot(name?: string, options?: { fullPage?: boolean }): Promise<any> {
    return this.callPlaywrightTool('playwright_screenshot', {
      name: name || `screenshot-${Date.now()}`,
      fullPage: options?.fullPage || false,
      storeBase64: true,
      savePng: true
    });
  }

  /**
   * Pressiona uma tecla
   */
  async pressKey(key: string, selector?: string): Promise<any> {
    return this.callPlaywrightTool('playwright_press_key', {
      key,
      selector
    });
  }

  /**
   * Obtém texto visível da página
   */
  async getVisibleText(): Promise<any> {
    return this.callPlaywrightTool('playwright_get_visible_text', {
      random_string: 'get_text'
    });
  }

  /**
   * Obtém HTML da página
   */
  async getVisibleHtml(): Promise<any> {
    return this.callPlaywrightTool('playwright_get_visible_html', {
      random_string: 'get_html'
    });
  }

  /**
   * Vai para a página anterior
   */
  async goBack(): Promise<any> {
    return this.callPlaywrightTool('playwright_go_back', {
      random_string: 'go_back'
    });
  }

  /**
   * Vai para a próxima página
   */
  async goForward(): Promise<any> {
    return this.callPlaywrightTool('playwright_go_forward', {
      random_string: 'go_forward'
    });
  }

  /**
   * Fecha o navegador
   */
  async close(): Promise<any> {
    return this.callPlaywrightTool('playwright_close', {
      random_string: 'close'
    });
  }

  /**
   * Executa JavaScript na página
   */
  async evaluate(script: string): Promise<any> {
    return this.callPlaywrightTool('playwright_evaluate', {
      script
    });
  }

  /**
   * Drag and drop
   */
  async drag(sourceSelector: string, targetSelector: string): Promise<any> {
    return this.callPlaywrightTool('playwright_drag', {
      sourceSelector,
      targetSelector
    });
  }

  /**
   * Obtém logs do console
   */
  async getConsoleLogs(options?: { type?: string; search?: string; limit?: number }): Promise<any> {
    return this.callPlaywrightTool('playwright_console_logs', {
      type: options?.type || 'all',
      search: options?.search,
      limit: options?.limit || 50,
      clear: false
    });
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