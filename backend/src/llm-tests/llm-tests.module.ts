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

// Controllers
import { ApiKeysController } from './controllers/api-keys.controller';
import { TestGenerationController } from './controllers/test-generation.controller';

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
  ],
  providers: [
    // LLM Providers
    OpenAIProvider,
    AnthropicProvider,
    GeminiProvider,
    
    // Services
    LLMProviderFactory,
    ApiKeyManagerService,
    TestPromptBuilderService,
    TestValidatorService,
    LLMTestGeneratorService,
    LLMTestExecutionService,
    
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
    OpenAIProvider,
    AnthropicProvider,
    GeminiProvider,
    PlaywrightMCPService,
  ],
})
export class LLMTestsModule {} 