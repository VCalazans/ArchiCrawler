import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { UserApiKey } from './entities/user-api-key.entity';
import { GeneratedTest } from './entities/generated-test.entity';
import { LLMProviderConfig } from './entities/llm-provider-config.entity';

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

// Controllers
import { ApiKeysController } from './controllers/api-keys.controller';
import { TestGenerationController } from './controllers/test-generation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserApiKey,
      GeneratedTest,
      LLMProviderConfig
    ]),
    ConfigModule,
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
  ],
  exports: [
    LLMProviderFactory,
    ApiKeyManagerService,
    TestPromptBuilderService,
    TestValidatorService,
    LLMTestGeneratorService,
    OpenAIProvider,
    AnthropicProvider,
    GeminiProvider,
  ],
})
export class LLMTestsModule {} 