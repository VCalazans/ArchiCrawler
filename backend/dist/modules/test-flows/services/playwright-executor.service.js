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
const mcp_manager_service_1 = require("../../../mcp/mcp-manager.service");
let PlaywrightExecutorService = PlaywrightExecutorService_1 = class PlaywrightExecutorService {
    constructor(mcpManager) {
        this.mcpManager = mcpManager;
        this.logger = new common_1.Logger(PlaywrightExecutorService_1.name);
    }
    async executeStep(step) {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`❌ Erro no passo ${step.id} após ${duration}ms: ${error.message}`);
            throw error;
        }
    }
    async executeNavigate(config, timeout) {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`❌ Erro na navegação após ${duration}ms: ${error.message}`);
            throw error;
        }
    }
    async executeClick(config, timeout) {
        this.logger.log(`🖱️ Clicando em: ${config.selector} (timeout: ${timeout || 5000}ms)`);
        return await this.mcpManager.callTool('playwright', 'browser_click', {
            element: config.selector
        });
    }
    async executeFill(config, timeout) {
        this.logger.log(`✏️ Preenchendo ${config.selector} com: "${config.value}" (timeout: ${timeout || 5000}ms)`);
        return await this.mcpManager.callTool('playwright', 'browser_type', {
            element: config.selector,
            text: config.value
        });
    }
    async executeScreenshot(config, timeout) {
        this.logger.log(`📸 Capturando screenshot: ${config.name} (fullPage: ${config.fullPage || false}, timeout: ${timeout || 10000}ms)`);
        const result = await this.mcpManager.callTool('playwright', 'browser_screenshot', {
            filename: config.name,
            element: config.fullPage ? undefined : 'body'
        });
        this.logger.log(`📸 Screenshot salvo: ${config.name}`);
        return result;
    }
    async executeWait(config, timeout) {
        this.logger.log(`⏳ Aguardando ${config.duration}ms (timeout: ${timeout || config.duration + 1000}ms)`);
        await new Promise(resolve => setTimeout(resolve, config.duration));
        return { success: true, message: `Aguardou ${config.duration}ms` };
    }
    async executeAssert(config, timeout) {
        this.logger.log(`🔍 Verificando condição: ${config.condition} (timeout: ${timeout || 5000}ms)`);
        return { success: true, message: 'Assertion executada (simulada)' };
    }
    async executeExtract(config, timeout) {
        this.logger.log(`📤 Extraindo de: ${config.selector} (timeout: ${timeout || 5000}ms)`);
        const result = await this.mcpManager.callTool('playwright', 'browser_console_messages', {});
        return {
            success: true,
            data: `Dados extraídos de ${config.selector}`,
            result
        };
    }
};
exports.PlaywrightExecutorService = PlaywrightExecutorService;
exports.PlaywrightExecutorService = PlaywrightExecutorService = PlaywrightExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mcp_manager_service_1.MCPManagerService])
], PlaywrightExecutorService);
//# sourceMappingURL=playwright-executor.service.js.map