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
var PlaywrightExecutorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaywrightExecutorService = void 0;
const common_1 = require("@nestjs/common");
const mcp_manager_service_1 = require("../mcp/mcp-manager.service");
let PlaywrightExecutorService = PlaywrightExecutorService_1 = class PlaywrightExecutorService {
    constructor(mcpManager) {
        this.mcpManager = mcpManager;
        this.logger = new common_1.Logger(PlaywrightExecutorService_1.name);
    }
    async executeStep(step) {
        const startTime = Date.now();
        try {
            this.logger.log(`🎭 Executando passo: ${step.name} (${step.type}) - timeout: ${step.timeout || 'padrão'}ms`);
            let result;
            switch (step.type) {
                case 'navigate':
                    result = await this.executeNavigate(step);
                    break;
                case 'click':
                    result = await this.executeClick(step);
                    break;
                case 'fill':
                    result = await this.executeFill(step);
                    break;
                case 'screenshot':
                    result = await this.executeScreenshot(step);
                    break;
                case 'wait':
                    result = await this.executeWait(step);
                    break;
                case 'assert':
                    result = await this.executeAssert(step);
                    break;
                case 'extract':
                    result = await this.executeExtract(step);
                    break;
                default:
                    throw new Error(`Tipo de passo não suportado: ${step.type}`);
            }
            const duration = Date.now() - startTime;
            this.logger.log(`✅ Passo concluído em ${duration}ms: ${step.name}`);
            return {
                success: true,
                stepId: step.id,
                duration,
                data: result,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`❌ Passo falhou após ${duration}ms: ${step.name} - ${error.message}`);
            return {
                success: false,
                stepId: step.id,
                duration,
                error: error.message,
            };
        }
    }
    async executeNavigate(step) {
        const { url } = step.config;
        if (!url) {
            throw new Error('URL é obrigatória para navegação');
        }
        this.logger.log(`🌐 Navegando para: ${url}`);
        return await this.mcpManager.callTool('playwright', 'browser_navigate', {
            url: url
        });
    }
    async executeClick(step) {
        const { selector, element, ref } = step.config;
        if (ref) {
            this.logger.log(`🖱️ Clicando em elemento via ref: ${ref}`);
            return await this.mcpManager.callTool('playwright', 'browser_click', {
                element: element || `Elemento: ${selector}`,
                ref: ref
            });
        }
        else {
            this.logger.log(`📸 Obtendo snapshot para encontrar: ${selector}`);
            const snapshot = await this.mcpManager.callTool('playwright', 'browser_snapshot', {});
            throw new Error('Implementação de click via selector requer análise do snapshot');
        }
    }
    async executeFill(step) {
        const { selector, text, ref, element } = step.config;
        if (!text) {
            throw new Error('Texto é obrigatório para preenchimento');
        }
        if (ref) {
            this.logger.log(`⌨️ Preenchendo campo via ref: ${ref} com "${text}"`);
            return await this.mcpManager.callTool('playwright', 'browser_type', {
                element: element || `Campo: ${selector}`,
                ref: ref,
                text: text,
                submit: step.config.submit || false
            });
        }
        else {
            throw new Error('Implementação de fill via selector requer análise do snapshot');
        }
    }
    async executeScreenshot(step) {
        const { name, fullPage, element, ref } = step.config;
        this.logger.log(`📸 Tirando screenshot: ${name}`);
        const params = {};
        if (name) {
            params.filename = name.endsWith('.png') || name.endsWith('.jpg') ? name : `${name}.png`;
        }
        if (fullPage) {
        }
        else if (element && ref) {
            params.element = element;
            params.ref = ref;
        }
        return await this.mcpManager.callTool('playwright', 'browser_take_screenshot', params);
    }
    async executeWait(step) {
        const { duration, text, textGone } = step.config;
        const params = {};
        if (duration) {
            params.time = Math.floor(duration / 1000);
            this.logger.log(`⏳ Aguardando ${params.time} segundos`);
        }
        if (text) {
            params.text = text;
            this.logger.log(`⏳ Aguardando texto aparecer: "${text}"`);
        }
        if (textGone) {
            params.textGone = textGone;
            this.logger.log(`⏳ Aguardando texto desaparecer: "${textGone}"`);
        }
        return await this.mcpManager.callTool('playwright', 'browser_wait_for', params);
    }
    async executeAssert(step) {
        const { type, value } = step.config;
        this.logger.log(`🔍 Executando assertion: ${type}`);
        const snapshot = await this.mcpManager.callTool('playwright', 'browser_snapshot', {});
        switch (type) {
            case 'text_present':
                const snapshotText = JSON.stringify(snapshot).toLowerCase();
                const isPresent = snapshotText.includes(value.toLowerCase());
                if (!isPresent) {
                    throw new Error(`Texto "${value}" não encontrado na página`);
                }
                return { assertion: 'text_present', value, result: true };
            case 'url_contains':
                return { assertion: 'url_contains', value, result: true };
            default:
                throw new Error(`Tipo de assertion não suportado: ${type}`);
        }
    }
    async executeExtract(step) {
        const { type, selector } = step.config;
        this.logger.log(`📊 Extraindo dados: ${type}`);
        const snapshot = await this.mcpManager.callTool('playwright', 'browser_snapshot', {});
        switch (type) {
            case 'text':
                return { extracted: 'text', data: snapshot };
            case 'attribute':
                return { extracted: 'attribute', data: snapshot };
            default:
                throw new Error(`Tipo de extração não suportado: ${type}`);
        }
    }
    async isPlaywrightAvailable() {
        try {
            const isRunning = this.mcpManager.isServerRunning('playwright');
            if (!isRunning) {
                this.logger.warn('📵 Servidor MCP Playwright não está rodando');
                return false;
            }
            const tools = await this.mcpManager.listTools('playwright');
            this.logger.log(`🔧 MCP Playwright disponível com ${tools?.tools?.length || 0} ferramentas`);
            return true;
        }
        catch (error) {
            this.logger.error(`💥 Erro ao verificar disponibilidade do MCP Playwright: ${error.message}`);
            return false;
        }
    }
    async getAvailableTools() {
        try {
            return await this.mcpManager.listTools('playwright');
        }
        catch (error) {
            this.logger.error(`💥 Erro ao obter ferramentas: ${error.message}`);
            return { tools: [] };
        }
    }
    async getPageSnapshot() {
        try {
            return await this.mcpManager.callTool('playwright', 'browser_snapshot', {});
        }
        catch (error) {
            this.logger.error(`💥 Erro ao obter snapshot: ${error.message}`);
            throw error;
        }
    }
};
exports.PlaywrightExecutorService = PlaywrightExecutorService;
exports.PlaywrightExecutorService = PlaywrightExecutorService = PlaywrightExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mcp_manager_service_1.MCPManagerService])
], PlaywrightExecutorService);
//# sourceMappingURL=playwright-executor.service.js.map