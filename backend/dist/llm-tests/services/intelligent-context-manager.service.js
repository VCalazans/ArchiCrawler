"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var IntelligentContextManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligentContextManager = void 0;
const common_1 = require("@nestjs/common");
let IntelligentContextManager = IntelligentContextManager_1 = class IntelligentContextManager {
    constructor() {
        this.logger = new common_1.Logger(IntelligentContextManager_1.name);
    }
    async updateContextWithMCPResult(context, action, result) {
        this.logger.debug(`🧠 Atualizando contexto após ação: ${action.type}`);
        const updatedPageState = {
            ...result.pageContext,
            hasChanges: result.changes.length > 0
        };
        const newConfidence = this.calculateConfidence(context, action, result);
        const updatedStrategy = await this.evaluateStrategy(context, action, result);
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
    calculateConfidence(context, action, result) {
        let confidence = context.confidence;
        if (result.success) {
            confidence += 5;
        }
        else {
            confidence -= 10;
        }
        if (action.type === 'navigate' && result.success) {
            confidence += 5;
        }
        if (action.type === 'click' && result.success && result.pageContext.hasChanges) {
            confidence += 10;
        }
        return Math.max(0, Math.min(100, confidence));
    }
    async evaluateStrategy(context, action, result) {
        const strategy = { ...context.currentStrategy };
        if (!result.success) {
            if (strategy.approach !== 'fallback') {
                strategy.approach = 'fallback';
                strategy.currentObjective = `Tentativa alternativa após falha em: ${action.description}`;
            }
        }
        if (strategy.approach === 'exploratory') {
            const foundElements = this.checkForExpectedElements(result.pageContext, strategy.expectedElements);
            if (foundElements.length > 0) {
                strategy.approach = 'direct';
                strategy.currentObjective = `Interagir com elementos encontrados: ${foundElements.join(', ')}`;
            }
        }
        return strategy;
    }
    checkForExpectedElements(pageContext, expectedElements) {
        const foundElements = [];
        expectedElements.forEach(element => {
            const elementText = element.toLowerCase();
            if (pageContext.visibleText?.toLowerCase().includes(elementText)) {
                foundElements.push(element);
            }
        });
        return foundElements;
    }
    async suggestNextActions(pageContext, goal) {
        const suggestions = [];
        suggestions.push({
            type: 'screenshot',
            description: 'Capturar screenshot do estado atual',
            reasoning: 'Para documentar o estado atual da página'
        });
        if (pageContext.hasChanges) {
            suggestions.push({
                type: 'analyze',
                description: 'Analisar mudanças na página',
                reasoning: 'A página mudou, vale a pena analisar o novo estado'
            });
        }
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
    generateThoughts(context, action, result) {
        const thoughts = [];
        thoughts.push(`Executei: ${action.description}`);
        if (result.success) {
            thoughts.push(`✅ Ação bem-sucedida`);
            if (result.changes.length > 0) {
                thoughts.push(`📝 Detectei ${result.changes.length} mudança(s) na página`);
            }
        }
        else {
            thoughts.push(`❌ Ação falhou: ${result.error}`);
            thoughts.push(`🔄 Preciso ajustar a estratégia`);
        }
        if (result.pageContext.errors.length > 0) {
            thoughts.push(`⚠️ Encontrei erros na página: ${result.pageContext.errors.join(', ')}`);
        }
        thoughts.push(`🎯 Confiança atual: ${context.confidence}%`);
        return thoughts.join(' | ');
    }
};
exports.IntelligentContextManager = IntelligentContextManager;
exports.IntelligentContextManager = IntelligentContextManager = IntelligentContextManager_1 = __decorate([
    (0, common_1.Injectable)()
], IntelligentContextManager);
//# sourceMappingURL=intelligent-context-manager.service.js.map