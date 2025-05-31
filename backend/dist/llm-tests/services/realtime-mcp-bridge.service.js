"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RealtimeMCPBridge_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeMCPBridge = void 0;
const common_1 = require("@nestjs/common");
const playwright_mcp_service_1 = require("../../mcp/services/playwright-mcp.service");
let RealtimeMCPBridge = RealtimeMCPBridge_1 = class RealtimeMCPBridge {
    constructor(playwrightMCPService) {
        this.playwrightMCPService = playwrightMCPService;
        this.logger = new common_1.Logger(RealtimeMCPBridge_1.name);
        this.previousPageState = null;
    }
    async executeActionWithAnalysis(action) {
        const startTime = Date.now();
        try {
            this.logger.debug(`🎯 Executando ação MCP: ${action.type} - ${action.description}`);
            const rawResult = await this.executeRawMCPAction(action);
            const pageContext = await this.capturePageContext();
            const changes = await this.detectPageChanges(pageContext);
            const performance = await this.getPerformanceMetrics();
            const screenshot = await this.captureSmartScreenshot(action);
            const duration = Date.now() - startTime;
            const result = {
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
            this.previousPageState = pageContext;
            return result;
        }
        catch (error) {
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
    async executeRawMCPAction(action) {
        try {
            switch (action.type) {
                case 'navigate':
                    if (!action.url)
                        throw new Error('URL necessária para navegação');
                    const navResult = await this.playwrightMCPService.navigate(action.url);
                    return { success: true, data: navResult };
                case 'click':
                    if (!action.selector)
                        throw new Error('Seletor necessário para clique');
                    const clickResult = await this.playwrightMCPService.click(action.selector);
                    return { success: true, data: clickResult };
                case 'fill':
                    if (!action.selector || !action.value)
                        throw new Error('Seletor e valor necessários para preenchimento');
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
                    const analysisResult = await this.analyzePage();
                    return { success: true, data: analysisResult };
                default:
                    throw new Error(`Tipo de ação não suportado: ${action.type}`);
            }
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async capturePageContext() {
        try {
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
        }
        catch (error) {
            this.logger.warn(`⚠️ Erro ao capturar contexto da página: ${error.message}`);
            return this.getSafePageContext();
        }
    }
    async detectPageChanges(currentState) {
        const changes = [];
        if (!this.previousPageState) {
            return changes;
        }
        if (this.previousPageState.url !== currentState.url) {
            changes.push({
                type: 'url_changed',
                oldValue: this.previousPageState.url,
                newValue: currentState.url,
                timestamp: new Date()
            });
        }
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
    async getPerformanceMetrics() {
        try {
            return {
                loadTime: 1000,
                domContentLoaded: 800,
                networkRequests: 5,
                errors: []
            };
        }
        catch (error) {
            return this.getSafePerformanceMetrics();
        }
    }
    async captureSmartScreenshot(action) {
        const screenshotActions = ['navigate', 'click', 'fill', 'screenshot'];
        if (screenshotActions.includes(action.type)) {
            try {
                const result = await this.playwrightMCPService.screenshot(`${action.type}-${Date.now()}`);
                return result.screenshot || result.base64;
            }
            catch (error) {
                this.logger.warn(`📷 Falha ao capturar screenshot: ${error.message}`);
                return undefined;
            }
        }
        return undefined;
    }
    async detectForms() {
        try {
            return [];
        }
        catch (error) {
            this.logger.warn(`🔍 Erro ao detectar formulários: ${error.message}`);
            return [];
        }
    }
    async detectButtons() {
        try {
            return [];
        }
        catch (error) {
            this.logger.warn(`🔍 Erro ao detectar botões: ${error.message}`);
            return [];
        }
    }
    async detectLinks() {
        try {
            return [];
        }
        catch (error) {
            this.logger.warn(`🔍 Erro ao detectar links: ${error.message}`);
            return [];
        }
    }
    async detectErrors() {
        try {
            return [];
        }
        catch (error) {
            return [];
        }
    }
    async getLoadingState() {
        try {
            return 'complete';
        }
        catch (error) {
            return 'error';
        }
    }
    async analyzePage() {
        try {
            const textResult = await this.playwrightMCPService.getVisibleText();
            const htmlResult = await this.playwrightMCPService.getVisibleHtml();
            return {
                analysis: 'Página analisada',
                elements: { textResult, htmlResult },
                timestamp: new Date()
            };
        }
        catch (error) {
            return { error: error.message };
        }
    }
    getSafePageContext() {
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
    getSafePerformanceMetrics() {
        return {
            loadTime: 0,
            domContentLoaded: 0,
            networkRequests: 0,
            errors: ['Erro ao capturar métricas']
        };
    }
    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.RealtimeMCPBridge = RealtimeMCPBridge;
exports.RealtimeMCPBridge = RealtimeMCPBridge = RealtimeMCPBridge_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [playwright_mcp_service_1.PlaywrightMCPService])
], RealtimeMCPBridge);
//# sourceMappingURL=realtime-mcp-bridge.service.js.map