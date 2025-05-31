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
var PlaywrightMCPService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaywrightMCPService = void 0;
const common_1 = require("@nestjs/common");
const mcp_manager_service_1 = require("../mcp-manager.service");
let PlaywrightMCPService = PlaywrightMCPService_1 = class PlaywrightMCPService {
    constructor(mcpManager) {
        this.mcpManager = mcpManager;
        this.logger = new common_1.Logger(PlaywrightMCPService_1.name);
        this.SERVER_NAME = 'playwright';
    }
    async ensurePlaywrightServerRunning() {
        if (!this.mcpManager.isServerRunning(this.SERVER_NAME)) {
            this.logger.debug('Iniciando servidor Playwright MCP...');
            await this.mcpManager.startServer(this.SERVER_NAME);
        }
    }
    async callPlaywrightTool(toolName, args = {}) {
        await this.ensurePlaywrightServerRunning();
        try {
            const result = await this.mcpManager.callTool(this.SERVER_NAME, toolName, args);
            this.logger.debug(`Playwright ${toolName} executado:`, { args, success: true });
            return result;
        }
        catch (error) {
            this.logger.error(`Erro no Playwright ${toolName}:`, { args, error: error.message });
            throw error;
        }
    }
    async navigate(url, options) {
        return this.callPlaywrightTool('playwright_navigate', {
            url,
            browserType: 'chromium',
            headless: false,
            waitUntil: options?.waitUntil || 'domcontentloaded',
            timeout: options?.timeout || 30000,
            width: 1280,
            height: 720
        });
    }
    async click(selector, options) {
        return this.callPlaywrightTool('playwright_click', {
            selector,
            timeout: options?.timeout || 10000
        });
    }
    async fill(selector, value, options) {
        return this.callPlaywrightTool('playwright_fill', {
            selector,
            value,
            timeout: options?.timeout || 10000
        });
    }
    async hover(selector, options) {
        return this.callPlaywrightTool('playwright_hover', {
            selector,
            timeout: options?.timeout || 10000
        });
    }
    async select(selector, value, options) {
        return this.callPlaywrightTool('playwright_select', {
            selector,
            value,
            timeout: options?.timeout || 10000
        });
    }
    async wait(milliseconds) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ waited: milliseconds });
            }, milliseconds);
        });
    }
    async screenshot(name, options) {
        return this.callPlaywrightTool('playwright_screenshot', {
            name: name || `screenshot-${Date.now()}`,
            fullPage: options?.fullPage || false,
            storeBase64: true,
            savePng: true
        });
    }
    async pressKey(key, selector) {
        return this.callPlaywrightTool('playwright_press_key', {
            key,
            selector
        });
    }
    async getVisibleText() {
        return this.callPlaywrightTool('playwright_get_visible_text', {
            random_string: 'get_text'
        });
    }
    async getVisibleHtml() {
        return this.callPlaywrightTool('playwright_get_visible_html', {
            random_string: 'get_html'
        });
    }
    async goBack() {
        return this.callPlaywrightTool('playwright_go_back', {
            random_string: 'go_back'
        });
    }
    async goForward() {
        return this.callPlaywrightTool('playwright_go_forward', {
            random_string: 'go_forward'
        });
    }
    async close() {
        return this.callPlaywrightTool('playwright_close', {
            random_string: 'close'
        });
    }
    async evaluate(script) {
        return this.callPlaywrightTool('playwright_evaluate', {
            script
        });
    }
    async drag(sourceSelector, targetSelector) {
        return this.callPlaywrightTool('playwright_drag', {
            sourceSelector,
            targetSelector
        });
    }
    async getConsoleLogs(options) {
        return this.callPlaywrightTool('playwright_console_logs', {
            type: options?.type || 'all',
            search: options?.search,
            limit: options?.limit || 50,
            clear: false
        });
    }
    async checkHealth() {
        try {
            await this.ensurePlaywrightServerRunning();
            const tools = await this.mcpManager.listTools(this.SERVER_NAME);
            return {
                healthy: true,
                message: `Playwright MCP ativo com ${tools.tools?.length || 0} ferramentas disponíveis`
            };
        }
        catch (error) {
            return {
                healthy: false,
                message: `Playwright MCP indisponível: ${error.message}`
            };
        }
    }
};
exports.PlaywrightMCPService = PlaywrightMCPService;
exports.PlaywrightMCPService = PlaywrightMCPService = PlaywrightMCPService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mcp_manager_service_1.MCPManagerService])
], PlaywrightMCPService);
//# sourceMappingURL=playwright-mcp.service.js.map