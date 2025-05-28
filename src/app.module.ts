import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScraperModule } from './scraper/scraper.module';
import { CoreModule } from './core/core.module';
import { HealthModule } from './health/health.module';
import { MCPModule } from './mcp/mcp.module';

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
    ScraperModule,
    CoreModule,
    HealthModule,
    MCPModule,
  ],
})
export class AppModule {}