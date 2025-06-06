"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMTestsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const user_api_key_entity_1 = require("./entities/user-api-key.entity");
const generated_test_entity_1 = require("./entities/generated-test.entity");
const llm_provider_config_entity_1 = require("./entities/llm-provider-config.entity");
const test_execution_entity_1 = require("../entities/test-execution.entity");
const openai_provider_1 = require("./providers/openai.provider");
const anthropic_provider_1 = require("./providers/anthropic.provider");
const gemini_provider_1 = require("./providers/gemini.provider");
const llm_provider_factory_1 = require("./services/llm-provider.factory");
const api_key_manager_service_1 = require("./services/api-key-manager.service");
const test_prompt_builder_service_1 = require("./services/test-prompt-builder.service");
const test_validator_service_1 = require("./services/test-validator.service");
const llm_test_generator_service_1 = require("./services/llm-test-generator.service");
const llm_test_execution_service_1 = require("./services/llm-test-execution.service");
const dynamic_test_agent_service_1 = require("./services/dynamic-test-agent.service");
const realtime_mcp_bridge_service_1 = require("./services/realtime-mcp-bridge.service");
const intelligent_context_manager_service_1 = require("./services/intelligent-context-manager.service");
const api_keys_controller_1 = require("./controllers/api-keys.controller");
const test_generation_controller_1 = require("./controllers/test-generation.controller");
const dynamic_test_chat_controller_1 = require("./controllers/dynamic-test-chat.controller");
const mcp_module_1 = require("../mcp/mcp.module");
const playwright_mcp_service_1 = require("../mcp/services/playwright-mcp.service");
let LLMTestsModule = class LLMTestsModule {
};
exports.LLMTestsModule = LLMTestsModule;
exports.LLMTestsModule = LLMTestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_api_key_entity_1.UserApiKey,
                generated_test_entity_1.GeneratedTest,
                llm_provider_config_entity_1.LLMProviderConfig,
                test_execution_entity_1.TestExecution
            ]),
            config_1.ConfigModule,
            mcp_module_1.MCPModule,
        ],
        controllers: [
            api_keys_controller_1.ApiKeysController,
            test_generation_controller_1.TestGenerationController,
            dynamic_test_chat_controller_1.DynamicTestChatController,
        ],
        providers: [
            openai_provider_1.OpenAIProvider,
            anthropic_provider_1.AnthropicProvider,
            gemini_provider_1.GeminiProvider,
            llm_provider_factory_1.LLMProviderFactory,
            api_key_manager_service_1.ApiKeyManagerService,
            test_prompt_builder_service_1.TestPromptBuilderService,
            test_validator_service_1.TestValidatorService,
            llm_test_generator_service_1.LLMTestGeneratorService,
            llm_test_execution_service_1.LLMTestExecutionService,
            dynamic_test_agent_service_1.DynamicTestAgentService,
            realtime_mcp_bridge_service_1.RealtimeMCPBridge,
            intelligent_context_manager_service_1.IntelligentContextManager,
            playwright_mcp_service_1.PlaywrightMCPService,
        ],
        exports: [
            llm_provider_factory_1.LLMProviderFactory,
            api_key_manager_service_1.ApiKeyManagerService,
            test_prompt_builder_service_1.TestPromptBuilderService,
            test_validator_service_1.TestValidatorService,
            llm_test_generator_service_1.LLMTestGeneratorService,
            llm_test_execution_service_1.LLMTestExecutionService,
            dynamic_test_agent_service_1.DynamicTestAgentService,
            realtime_mcp_bridge_service_1.RealtimeMCPBridge,
            intelligent_context_manager_service_1.IntelligentContextManager,
            openai_provider_1.OpenAIProvider,
            anthropic_provider_1.AnthropicProvider,
            gemini_provider_1.GeminiProvider,
            playwright_mcp_service_1.PlaywrightMCPService,
        ],
    })
], LLMTestsModule);
//# sourceMappingURL=llm-tests.module.js.map