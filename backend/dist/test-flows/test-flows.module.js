"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFlowsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const test_flows_service_1 = require("./test-flows.service");
const test_flows_controller_1 = require("./test-flows.controller");
const test_flow_entity_1 = require("../entities/test-flow.entity");
const test_execution_entity_1 = require("../entities/test-execution.entity");
const playwright_executor_service_1 = require("./playwright-executor.service");
const mcp_module_1 = require("../mcp/mcp.module");
let TestFlowsModule = class TestFlowsModule {
};
exports.TestFlowsModule = TestFlowsModule;
exports.TestFlowsModule = TestFlowsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([test_flow_entity_1.TestFlow, test_execution_entity_1.TestExecution]),
            mcp_module_1.MCPModule,
        ],
        controllers: [test_flows_controller_1.TestFlowsController, test_flows_controller_1.TestExecutionsController],
        providers: [
            test_flows_service_1.TestFlowsService,
            playwright_executor_service_1.PlaywrightExecutorService,
        ],
        exports: [test_flows_service_1.TestFlowsService, playwright_executor_service_1.PlaywrightExecutorService],
    })
], TestFlowsModule);
//# sourceMappingURL=test-flows.module.js.map