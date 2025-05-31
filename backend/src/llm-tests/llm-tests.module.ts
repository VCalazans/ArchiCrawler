import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { UserApiKey } from './entities/user-api-key.entity';
import { GeneratedTest } from './entities/generated-test.entity';
import { LLMProviderConfig } from './entities/llm-provider-config.entity';
import { TestExecution } from '../entities/test-execution.entity';

// Providers
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GeminiProvider } from './providers/gemini.provider';

// Services
import { LLMProviderFactory } from './services/llm-provider.factory';
import { ApiKeyManagerService } from './services/api-key-manager.service';
import { TestPromptBuilderService } from './services/test-prompt-builder.service';
import { TestValidatorService } from './services/test-validator.service';
import { LLMTestGeneratorService } from './services/llm-test-generator.service';
import { LLMTestExecutionService } from './services/llm-test-execution.service';

// 🚀 NOVOS SERVIÇOS DINÂMICOS
import { DynamicTestAgentService } from './services/dynamic-test-agent.service';
import { RealtimeMCPBridge } from './services/realtime-mcp-bridge.service';
import { IntelligentContextManager } from './services/intelligent-context-manager.service';

// Controllers
import { ApiKeysController } from './controllers/api-keys.controller';
import { TestGenerationController } from './controllers/test-generation.controller';
import { DynamicTestChatController } from './controllers/dynamic-test-chat.controller';

// MCP Integration
import { MCPModule } from '../mcp/mcp.module';
import { PlaywrightMCPService } from '../mcp/services/playwright-mcp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserApiKey,
      GeneratedTest,
      LLMProviderConfig,
      TestExecution
    ]),
    ConfigModule,
    MCPModule,
  ],
  controllers: [
    ApiKeysController,
    TestGenerationController,
    DynamicTestChatController,
  ],
  providers: [
    // LLM Providers
    OpenAIProvider,
    AnthropicProvider,
    GeminiProvider,
    
    // Core Services
    LLMProviderFactory,
    ApiKeyManagerService,
    TestPromptBuilderService,
    TestValidatorService,
    LLMTestGeneratorService,
    LLMTestExecutionService,
    
    // 🚀 NOVOS SERVIÇOS DINÂMICOS
    DynamicTestAgentService,
    RealtimeMCPBridge,
    IntelligentContextManager,
    
    // MCP Services
    PlaywrightMCPService,
  ],
  exports: [
    LLMProviderFactory,
    ApiKeyManagerService,
    TestPromptBuilderService,
    TestValidatorService,
    LLMTestGeneratorService,
    LLMTestExecutionService,
    
    // 🚀 EXPORTAR NOVOS SERVIÇOS
    DynamicTestAgentService,
    RealtimeMCPBridge,
    IntelligentContextManager,
    
    OpenAIProvider,
    AnthropicProvider,
    GeminiProvider,
    PlaywrightMCPService,
  ],
})
export class LLMTestsModule {} 