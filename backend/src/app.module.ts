import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { ScraperModule } from './scraper/scraper.module';
import { CoreModule } from './core/core.module';
import { HealthModule } from './health/health.module';
import { MCPModule } from './mcp/mcp.module';
import { AuthModule } from './auth/auth.module';
import { TestFlowsModule } from './test-flows/test-flows.module';
import { LLMTestsModule } from './llm-tests/llm-tests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    DatabaseModule,
    AuthModule,
    ScraperModule,
    CoreModule,
    HealthModule,
    MCPModule,
    TestFlowsModule,
    LLMTestsModule,
  ],
})
export class AppModule {}