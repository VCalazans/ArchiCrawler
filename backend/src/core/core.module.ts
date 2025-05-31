import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EngineFactoryService } from './services/engine-factory.service';
import { PlaywrightEngineFactory } from './engines/playwright/playwright-engine-factory';
import { PuppeteerEngineFactory } from './engines/puppeteer/puppeteer-engine-factory';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    EngineFactoryService,
    PlaywrightEngineFactory,
    PuppeteerEngineFactory,
  ],
  exports: [EngineFactoryService],
})
export class CoreModule {}