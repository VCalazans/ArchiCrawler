"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const database_module_1 = require("./database/database.module");
const scraper_module_1 = require("./scraper/scraper.module");
const core_module_1 = require("./core/core.module");
const health_module_1 = require("./health/health.module");
const mcp_module_1 = require("./mcp/mcp.module");
const auth_module_1 = require("./auth/auth.module");
const test_flows_module_1 = require("./test-flows/test-flows.module");
const llm_tests_module_1 = require("./llm-tests/llm-tests.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot({
                ttl: 60,
                limit: 10,
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            scraper_module_1.ScraperModule,
            core_module_1.CoreModule,
            health_module_1.HealthModule,
            mcp_module_1.MCPModule,
            test_flows_module_1.TestFlowsModule,
            llm_tests_module_1.LLMTestsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map