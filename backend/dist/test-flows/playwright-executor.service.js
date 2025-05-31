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
            this.logger.log(`🎬 Executando passo real: ${step.name} (${step.type})`);
            let result;
            switch (step.type) {
                case 'navigate':
                    result = await this.executeNavigate(step.config);
                    break;
                case 'click':
                    result = await this.executeClick(step.config);
                    break;
                case 'fill':
                    result = await this.executeFill(step.config);
                    break;
                case 'screenshot':
                    result = await this.executeScreenshot(step.config);
                    break;
                case 'wait':
                    result = await this.executeWait(step.config);
                    break;
                case 'assert':
                    result = await this.executeAssert(step.config);
                    break;
                case 'extract':
                    result = await this.executeExtract(step.config);
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`❌ Erro no passo ${step.name}:`, error.message);
            return {
                success: false,
                error: error.message,
                duration
            };
        }
    }
    async executeNavigate(config) {
        if (!this.mcpManager.isServerRunning('playwright')) {
            throw new Error('Servidor Playwright MCP não está rodando');
        }
        return await this.mcpManager.callTool('playwright', 'playwright_navigate', {
            url: config.url,
            waitUntil: config.waitUntil || 'domcontentloaded',
            timeout: 30000
        });
    }
    async executeClick(config) {
        if (!this.mcpManager.isServerRunning('playwright')) {
            throw new Error('Servidor Playwright MCP não está rodando');
        }
        return await this.mcpManager.callTool('playwright', 'playwright_click', {
            selector: config.selector
        });
    }
    async executeFill(config) {
        if (!this.mcpManager.isServerRunning('playwright')) {
            throw new Error('Servidor Playwright MCP não está rodando');
        }
        return await this.mcpManager.callTool('playwright', 'playwright_fill', {
            selector: config.selector,
            value: config.value
        });
    }
    async executeScreenshot(config) {
        if (!this.mcpManager.isServerRunning('playwright')) {
            throw new Error('Servidor Playwright MCP não está rodando');
        }
        return await this.mcpManager.callTool('playwright', 'playwright_screenshot', {
            name: config.name,
            fullPage: config.fullPage || false,
            storeBase64: true
        });
    }
    async executeWait(config) {
        this.logger.log(`⏳ Aguardando ${config.duration}ms`);
        await new Promise(resolve => setTimeout(resolve, config.duration));
        return { waited: config.duration };
    }
    async executeAssert(config) {
        if (!this.mcpManager.isServerRunning('playwright')) {
            throw new Error('Servidor Playwright MCP não está rodando');
        }
        switch (config.type) {
            case 'text':
                const textContentResult = await this.mcpManager.callTool('playwright', 'playwright_evaluate', {
                    script: `document.querySelector('${config.selector}')?.textContent || ''`
                });
                const textContent = textContentResult?.result || textContentResult;
                if (!textContent.includes(config.expected)) {
                    throw new Error(`Texto esperado "${config.expected}" não encontrado. Encontrado: "${textContent}"`);
                }
                return { assertion: 'text', passed: true, expected: config.expected, actual: textContent };
            case 'element':
                const elementExistsResult = await this.mcpManager.callTool('playwright', 'playwright_evaluate', {
                    script: `!!document.querySelector('${config.selector}')`
                });
                const elementExists = elementExistsResult?.result || elementExistsResult;
                if (!elementExists) {
                    throw new Error(`Elemento "${config.selector}" não encontrado`);
                }
                return { assertion: 'element', passed: true, selector: config.selector };
            case 'url':
                const currentUrlResult = await this.mcpManager.callTool('playwright', 'playwright_evaluate', {
                    script: 'window.location.href'
                });
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
    async executeExtract(config) {
        if (!this.mcpManager.isServerRunning('playwright')) {
            throw new Error('Servidor Playwright MCP não está rodando');
        }
        let script;
        if (config.attribute) {
            script = `document.querySelector('${config.selector}')?.getAttribute('${config.attribute}') || null`;
        }
        else if (config.property) {
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
        }
        else {
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
    async isPlaywrightAvailable() {
        return this.mcpManager.isServerRunning('playwright');
    }
    async initializeBrowser() {
        if (!this.mcpManager.isServerRunning('playwright')) {
            throw new Error('Servidor Playwright MCP não está rodando');
        }
        this.logger.log('🌐 Browser inicializado via MCP Playwright');
    }
    async closeBrowser() {
        if (this.mcpManager.isServerRunning('playwright')) {
            try {
                await this.mcpManager.callTool('playwright', 'playwright_close', {
                    random_string: 'cleanup'
                });
                this.logger.log('🔒 Browser fechado');
            }
            catch (error) {
                this.logger.warn('Erro ao fechar browser:', error.message);
            }
        }
    }
};
exports.PlaywrightExecutorService = PlaywrightExecutorService;
exports.PlaywrightExecutorService = PlaywrightExecutorService = PlaywrightExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mcp_manager_service_1.MCPManagerService])
], PlaywrightExecutorService);
//# sourceMappingURL=playwright-executor.service.js.map