import { Injectable, Logger } from '@nestjs/common';
import { PlaywrightMCPService } from '../../mcp/services/playwright-mcp.service';
import { MCPAction, MCPResult, PageContext } from './dynamic-test-agent.service';
import { PageChange, PerformanceMetrics, FormInfo, ButtonInfo, LinkInfo } from '../interfaces/dynamic-agent.interface';

@Injectable()
export class RealtimeMCPBridge {
  private readonly logger = new Logger(RealtimeMCPBridge.name);
  private previousPageState: PageContext | null = null;

  constructor(
    private readonly playwrightMCPService: PlaywrightMCPService,
  ) {}

  /**
   * 📱 Executa ação MCP com análise automática do resultado
   */
  async executeActionWithAnalysis(action: MCPAction): Promise<MCPResult> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`🎯 Executando ação MCP: ${action.type} - ${action.description}`);

      // 1. Executar ação via Playwright MCP
      const rawResult = await this.executeRawMCPAction(action);
      
      // 2. Capturar contexto da página automaticamente
      const pageContext = await this.capturePageContext();
      
      // 3. Detectar mudanças/erros automaticamente
      const changes = await this.detectPageChanges(pageContext);
      
      // 4. Capturar métricas de performance
      const performance = await this.getPerformanceMetrics();

      // 5. Screenshot inteligente (só quando necessário)
      const screenshot = await this.captureSmartScreenshot(action);

      const duration = Date.now() - startTime;

      const result: MCPResult = {
        success: rawResult.success,
        duration,
        data: rawResult.data,
        error: rawResult.error,
        pageContext,
        changes,
        screenshot,
        performance
      };

      this.logger.debug(`✅ Ação concluída em ${duration}ms - Sucesso: ${result.success}`);
      
      // Atualizar estado anterior para próxima comparação
      this.previousPageState = pageContext;
      
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`❌ Erro na execução MCP: ${error.message}`);
      
      return {
        success: false,
        duration,
        error: error.message,
        pageContext: await this.getSafePageContext(),
        changes: [],
        performance: await this.getSafePerformanceMetrics()
      };
    }
  }

  /**
   * 🎭 Executa ação raw no Playwright MCP
   */
  private async executeRawMCPAction(action: MCPAction): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      switch (action.type) {
        case 'navigate':
          if (!action.url) throw new Error('URL necessária para navegação');
          const navResult = await this.playwrightMCPService.navigate(action.url);
          return { success: true, data: navResult };

        case 'click':
          if (!action.selector) throw new Error('Seletor necessário para clique');
          const clickResult = await this.playwrightMCPService.click(action.selector);
          return { success: true, data: clickResult };

        case 'fill':
          if (!action.selector || !action.value) throw new Error('Seletor e valor necessários para preenchimento');
          const fillResult = await this.playwrightMCPService.fill(action.selector, action.value);
          return { success: true, data: fillResult };

        case 'screenshot':
          const screenshotResult = await this.playwrightMCPService.screenshot('auto-screenshot');
          return { success: true, data: screenshotResult };

        case 'wait':
          const waitTime = parseInt(action.value || '2000');
          await this.wait(waitTime);
          return { success: true, data: { waited: waitTime } };

        case 'analyze':
          // Análise personalizada da página
          const analysisResult = await this.analyzePage();
          return { success: true, data: analysisResult };

        default:
          throw new Error(`Tipo de ação não suportado: ${action.type}`);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 📷 Captura contexto completo da página
   */
  private async capturePageContext(): Promise<PageContext> {
    try {
      // Usar getVisibleText e getVisibleHtml do PlaywrightMCPService
      const textResult = await this.playwrightMCPService.getVisibleText();
      const htmlResult = await this.playwrightMCPService.getVisibleHtml();
      
      return {
        url: textResult.url || '',
        title: textResult.title || '',
        visibleText: textResult.text || '',
        forms: await this.detectForms(),
        buttons: await this.detectButtons(),
        links: await this.detectLinks(),
        errors: await this.detectErrors(),
        loadingState: await this.getLoadingState(),
        hasChanges: false
      };
    } catch (error) {
      this.logger.warn(`⚠️ Erro ao capturar contexto da página: ${error.message}`);
      return this.getSafePageContext();
    }
  }

  /**
   * 🔍 Detecta mudanças na página
   */
  private async detectPageChanges(currentState: PageContext): Promise<PageChange[]> {
    const changes: PageChange[] = [];

    if (!this.previousPageState) {
      return changes; // Primeira execução
    }

    // Detectar mudança de URL
    if (this.previousPageState.url !== currentState.url) {
      changes.push({
        type: 'url_changed',
        oldValue: this.previousPageState.url,
        newValue: currentState.url,
        timestamp: new Date()
      });
    }

    // Detectar mudanças no conteúdo
    if (this.previousPageState.visibleText !== currentState.visibleText) {
      changes.push({
        type: 'content_changed',
        oldValue: this.previousPageState.visibleText.substring(0, 100),
        newValue: currentState.visibleText.substring(0, 100),
        timestamp: new Date()
      });
    }

    return changes;
  }

  /**
   * 📊 Obter métricas de performance
   */
  private async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      // Implementar captura de métricas via Playwright
      return {
        loadTime: 1000, // Placeholder
        domContentLoaded: 800,
        networkRequests: 5,
        errors: []
      };
    } catch (error) {
      return this.getSafePerformanceMetrics();
    }
  }

  /**
   * 📷 Screenshot inteligente (só quando necessário)
   */
  private async captureSmartScreenshot(action: MCPAction): Promise<string | undefined> {
    // Capturar screenshot apenas para ações importantes ou quando solicitado
    const screenshotActions = ['navigate', 'click', 'fill', 'screenshot'];
    
    if (screenshotActions.includes(action.type)) {
      try {
        const result = await this.playwrightMCPService.screenshot(`${action.type}-${Date.now()}`);
        return result.screenshot || result.base64;
      } catch (error) {
        this.logger.warn(`📷 Falha ao capturar screenshot: ${error.message}`);
        return undefined;
      }
    }
    
    return undefined;
  }

  /**
   * 🔍 Detectar formulários na página
   */
  private async detectForms(): Promise<FormInfo[]> {
    try {
      // Implementar detecção de formulários via JavaScript injection
      return []; // Placeholder
    } catch (error) {
      this.logger.warn(`🔍 Erro ao detectar formulários: ${error.message}`);
      return [];
    }
  }

  /**
   * 🔍 Detectar botões na página
   */
  private async detectButtons(): Promise<ButtonInfo[]> {
    try {
      // Implementar detecção de botões via JavaScript injection
      return []; // Placeholder
    } catch (error) {
      this.logger.warn(`🔍 Erro ao detectar botões: ${error.message}`);
      return [];
    }
  }

  /**
   * 🔍 Detectar links na página
   */
  private async detectLinks(): Promise<LinkInfo[]> {
    try {
      // Implementar detecção de links via JavaScript injection
      return []; // Placeholder
    } catch (error) {
      this.logger.warn(`🔍 Erro ao detectar links: ${error.message}`);
      return [];
    }
  }

  /**
   * 🔍 Detectar erros na página
   */
  private async detectErrors(): Promise<string[]> {
    try {
      // Implementar detecção de erros via console logs ou elementos de erro
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * ⏳ Verificar estado de carregamento
   */
  private async getLoadingState(): Promise<'loading' | 'complete' | 'error'> {
    try {
      // Implementar verificação de estado de carregamento
      return 'complete'; // Placeholder
    } catch (error) {
      return 'error';
    }
  }

  /**
   * 🧪 Análise personalizada da página
   */
  private async analyzePage(): Promise<any> {
    try {
      const textResult = await this.playwrightMCPService.getVisibleText();
      const htmlResult = await this.playwrightMCPService.getVisibleHtml();
      
      return {
        analysis: 'Página analisada',
        elements: { textResult, htmlResult },
        timestamp: new Date()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * 🛡️ Contexto seguro em caso de erro
   */
  private getSafePageContext(): PageContext {
    return {
      url: '',
      title: 'Erro ao capturar',
      visibleText: '',
      forms: [],
      buttons: [],
      links: [],
      errors: ['Erro ao capturar contexto da página'],
      loadingState: 'error',
      hasChanges: false
    };
  }

  /**
   * 🛡️ Métricas seguras em caso de erro
   */
  private getSafePerformanceMetrics(): PerformanceMetrics {
    return {
      loadTime: 0,
      domContentLoaded: 0,
      networkRequests: 0,
      errors: ['Erro ao capturar métricas']
    };
  }

  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 