"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../auth/entities/user.entity");
const api_key_entity_1 = require("../auth/entities/api-key.entity");
const mcp_client_entity_1 = require("../auth/entities/mcp-client.entity");
const test_flow_entity_1 = require("../entities/test-flow.entity");
const test_execution_entity_1 = require("../entities/test-execution.entity");
const user_api_key_entity_1 = require("../llm-tests/entities/user-api-key.entity");
const generated_test_entity_1 = require("../llm-tests/entities/generated-test.entity");
const llm_provider_config_entity_1 = require("../llm-tests/entities/llm-provider-config.entity");
const test_execution_result_entity_1 = require("../llm-tests/entities/test-execution-result.entity");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST') || '145.223.79.190',
                    port: configService.get('DB_PORT') || 5432,
                    username: configService.get('DB_USERNAME') || 'archicode',
                    password: configService.get('DB_PASSWORD') || '#Archicode2025',
                    database: configService.get('DB_DATABASE') || 'archicrawler',
                    entities: [
                        user_entity_1.User,
                        api_key_entity_1.ApiKey,
                        mcp_client_entity_1.MCPClient,
                        test_flow_entity_1.TestFlow,
                        test_execution_entity_1.TestExecution,
                        user_api_key_entity_1.UserApiKey,
                        generated_test_entity_1.GeneratedTest,
                        llm_provider_config_entity_1.LLMProviderConfig,
                        test_execution_result_entity_1.TestExecutionResult
                    ],
                    synchronize: false,
                    logging: configService.get('NODE_ENV') === 'development',
                    ssl: false,
                    extra: {
                        connectionTimeoutMillis: 30000,
                        idleTimeoutMillis: 30000,
                        max: 20,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map