import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EngineType } from '../constants/engine-types.enum';
import { ScraperEngineFactory } from '../interfaces/scraper-engine-factory.interface';
import { ScraperEngine } from '../interfaces/scraper-engine.interface';
import { ScraperOptions } from '../interfaces/scraper-options.interface';
import { PlaywrightEngineFactory } from '../engines/playwright/playwright-engine-factory';
import { PuppeteerEngineFactory } from '../engines/puppeteer/puppeteer-engine-factory';

@Injectable()
export class EngineFactoryService {
  private factories: Map<EngineType, ScraperEngineFactory>;
  private defaultEngine: EngineType;

  constructor(
    private configService: ConfigService,
    private playwrightFactory: PlaywrightEngineFactory,
    private puppeteerFactory: PuppeteerEngineFactory,
  ) {
    this.factories = new Map<EngineType, ScraperEngineFactory>();
    this.factories.set(EngineType.PLAYWRIGHT, playwrightFactory);
    this.factories.set(EngineType.PUPPETEER, puppeteerFactory);
    
    // Set default engine from config or use PLAYWRIGHT as default
    this.defaultEngine = 
      (this.configService.get<EngineType>('DEFAULT_ENGINE') as EngineType) || 
      EngineType.PLAYWRIGHT;
  }

  /**
   * Create a scraper engine of the specified type
   * @param engineType Type of scraper engine to create
   * @param options Scraper engine options
   */
  async createEngine(
    engineType: EngineType = this.defaultEngine,
    options?: ScraperOptions,
  ): Promise<ScraperEngine> {
    const factory = this.factories.get(engineType);
    
    if (!factory) {
      throw new Error(`Unsupported engine type: ${engineType}`);
    }
    
    return factory.create(options);
  }
  
  /**
   * Get the available engine types
   */
  getAvailableEngines(): EngineType[] {
    return Array.from(this.factories.keys());
  }
  
  /**
   * Get the default engine type
   */
  getDefaultEngine(): EngineType {
    return this.defaultEngine;
  }
}