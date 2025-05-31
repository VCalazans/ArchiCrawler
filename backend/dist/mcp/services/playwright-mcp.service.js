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
        return this.callPlaywrightTool('browser_navigate', {
            url
        });
    }
    async click(selector, options) {
        const snapshot = await this.callPlaywrightTool('browser_snapshot');
        return this.callPlaywrightTool('browser_click', {
            element: selector,
            ref: selector
        });
    }
    async fill(selector, value, options) {
        const snapshot = await this.callPlaywrightTool('browser_snapshot');
        return this.callPlaywrightTool('browser_type', {
            element: selector,
            ref: selector,
            text: value
        });
    }
    async hover(selector, options) {
        const snapshot = await this.callPlaywrightTool('browser_snapshot');
        return this.callPlaywrightTool('browser_hover', {
            element: selector,
            ref: selector
        });
    }
    async select(selector, value, options) {
        const snapshot = await this.callPlaywrightTool('browser_snapshot');
        return this.callPlaywrightTool('browser_select_option', {
            element: selector,
            ref: selector,
            values: [value]
        });
    }
    async wait(milliseconds) {
        return this.callPlaywrightTool('browser_wait_for', {
            time: milliseconds / 1000
        });
    }
    async screenshot(name, options) {
        return this.callPlaywrightTool('browser_take_screenshot', {
            filename: name || `screenshot-${Date.now()}.png`,
            raw: false
        });
    }
    async pressKey(key, selector) {
        return this.callPlaywrightTool('browser_press_key', {
            key
        });
    }
    async getVisibleText() {
        return this.callPlaywrightTool('browser_snapshot');
    }
    async getVisibleHtml() {
        return this.callPlaywrightTool('browser_snapshot');
    }
    async goBack() {
        return this.callPlaywrightTool('browser_navigate_back');
    }
    async goForward() {
        return this.callPlaywrightTool('browser_navigate_forward');
    }
    async close() {
        return this.callPlaywrightTool('browser_close');
    }
    async evaluate(script) {
        throw new Error('JavaScript evaluation não disponível via MCP Playwright');
    }
    async drag(sourceSelector, targetSelector) {
        const snapshot = await this.callPlaywrightTool('browser_snapshot');
        return this.callPlaywrightTool('browser_drag', {
            startElement: sourceSelector,
            startRef: sourceSelector,
            endElement: targetSelector,
            endRef: targetSelector
        });
    }
    async getConsoleLogs(options) {
        return this.callPlaywrightTool('browser_console_messages');
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