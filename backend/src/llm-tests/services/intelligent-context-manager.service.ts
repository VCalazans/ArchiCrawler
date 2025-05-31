import { Injectable, Logger } from '@nestjs/common';
import { TestContext, MCPAction, MCPResult } from './dynamic-test-agent.service';

@Injectable()
export class IntelligentContextManager {
  private readonly logger = new Logger(IntelligentContextManager.name);

  /**
   * 🧠 Atualiza contexto baseado no resultado de uma ação MCP
   */
  async updateContextWithMCPResult(
    context: TestContext,
    action: MCPAction,
    result: MCPResult
  ): Promise<TestContext> {
    this.logger.debug(`🧠 Atualizando contexto após ação: ${action.type}`);

    // Atualizar estado da página
    const updatedPageState = {
      ...result.pageContext,
      hasChanges: result.changes.length > 0
    };

    // Calcular nova confiança baseada no resultado
    const newConfidence = this.calculateConfidence(context, action, result);

    // Atualizar estratégia se necessário
    const updatedStrategy = await this.evaluateStrategy(context, action, result);

    // Sugerir próximas ações possíveis
    const nextActions = await this.suggestNextActions(updatedPageState, context.goal);

    return {
      ...context,
      currentUrl: result.pageContext.url,
      pageState: updatedPageState,
      confidence: newConfidence,
      currentStrategy: updatedStrategy,
      nextPossibleActions: nextActions,
      llmThoughts: this.generateThoughts(context, action, result)
    };
  }

  /**
   * 📊 Calcula confiança baseada nos resultados
   */
  private calculateConfidence(context: TestContext, action: MCPAction, result: MCPResult): number {
    let confidence = context.confidence;

    // Aumentar confiança em caso de sucesso
    if (result.success) {
      confidence += 5;
    } else {
      // Diminuir confiança em caso de falha
      confidence -= 10;
    }

    // Ajustar baseado no tipo de ação
    if (action.type === 'navigate' && result.success) {
      confidence += 5; // Navegação bem-sucedida é sempre boa
    }

    if (action.type === 'click' && result.success && result.pageContext.hasChanges) {
      confidence += 10; // Clique que causou mudança é muito bom
    }

    // Limitar entre 0 e 100
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * 🎯 Avalia e atualiza estratégia
   */
  private async evaluateStrategy(
    context: TestContext, 
    action: MCPAction, 
    result: MCPResult
  ): Promise<typeof context.currentStrategy> {
    const strategy = { ...context.currentStrategy };

    // Se a ação falhou, considerar fallback
    if (!result.success) {
      if (strategy.approach !== 'fallback') {
        strategy.approach = 'fallback';
        strategy.currentObjective = `Tentativa alternativa após falha em: ${action.description}`;
      }
    }

    // Se estivermos em modo exploratório e encontramos elementos esperados
    if (strategy.approach === 'exploratory') {
      const foundElements = this.checkForExpectedElements(result.pageContext, strategy.expectedElements);
      if (foundElements.length > 0) {
        strategy.approach = 'direct';
        strategy.currentObjective = `Interagir com elementos encontrados: ${foundElements.join(', ')}`;
      }
    }

    return strategy;
  }

  /**
   * 🔍 Verifica se elementos esperados estão presentes
   */
  private checkForExpectedElements(pageContext: any, expectedElements: string[]): string[] {
    const foundElements: string[] = [];
    
    expectedElements.forEach(element => {
      // Buscar elemento no texto visível ou formulários/botões
      const elementText = element.toLowerCase();
      if (pageContext.visibleText?.toLowerCase().includes(elementText)) {
        foundElements.push(element);
      }
    });

    return foundElements;
  }

  /**
   * 🎯 Sugere próximas ações possíveis
   */
  private async suggestNextActions(pageContext: any, goal: string): Promise<MCPAction[]> {
    const suggestions: MCPAction[] = [];

    // Sempre sugerir screenshot como opção
    suggestions.push({
      type: 'screenshot',
      description: 'Capturar screenshot do estado atual',
      reasoning: 'Para documentar o estado atual da página'
    });

    // Sugerir análise se houver mudanças
    if (pageContext.hasChanges) {
      suggestions.push({
        type: 'analyze',
        description: 'Analisar mudanças na página',
        reasoning: 'A página mudou, vale a pena analisar o novo estado'
      });
    }

    // Sugerir wait se a página está carregando
    if (pageContext.loadingState === 'loading') {
      suggestions.push({
        type: 'wait',
        value: '3000',
        description: 'Aguardar carregamento da página',
        reasoning: 'Página ainda está carregando'
      });
    }

    return suggestions;
  }

  /**
   * 💭 Gera pensamentos da LLM sobre o estado atual
   */
  private generateThoughts(context: TestContext, action: MCPAction, result: MCPResult): string {
    const thoughts = [];

    thoughts.push(`Executei: ${action.description}`);
    
    if (result.success) {
      thoughts.push(`✅ Ação bem-sucedida`);
      if (result.changes.length > 0) {
        thoughts.push(`📝 Detectei ${result.changes.length} mudança(s) na página`);
      }
    } else {
      thoughts.push(`❌ Ação falhou: ${result.error}`);
      thoughts.push(`🔄 Preciso ajustar a estratégia`);
    }

    if (result.pageContext.errors.length > 0) {
      thoughts.push(`⚠️ Encontrei erros na página: ${result.pageContext.errors.join(', ')}`);
    }

    thoughts.push(`🎯 Confiança atual: ${context.confidence}%`);

    return thoughts.join(' | ');
  }
} 