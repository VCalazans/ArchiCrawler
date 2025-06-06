"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPModule = void 0;
const common_1 = require("@nestjs/common");
const mcp_manager_service_1 = require("./mcp-manager.service");
const mcp_controller_1 = require("./mcp.controller");
const playwright_mcp_service_1 = require("./services/playwright-mcp.service");
const auth_module_1 = require("../auth/auth.module");
let MCPModule = class MCPModule {
};
exports.MCPModule = MCPModule;
exports.MCPModule = MCPModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        providers: [
            mcp_manager_service_1.MCPManagerService,
            playwright_mcp_service_1.PlaywrightMCPService,
        ],
        controllers: [mcp_controller_1.MCPController],
        exports: [
            mcp_manager_service_1.MCPManagerService,
            playwright_mcp_service_1.PlaywrightMCPService,
        ],
    })
], MCPModule);
//# sourceMappingURL=mcp.module.js.map