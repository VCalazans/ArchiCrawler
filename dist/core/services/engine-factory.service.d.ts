import { ConfigService } from '@nestjs/config';
import { EngineType } from '../constants/engine-types.enum';
import { ScraperEngine } from '../interfaces/scraper-engine.interface';
import { ScraperOptions } from '../interfaces/scraper-options.interface';
import { PlaywrightEngineFactory } from '../engines/playwright/playwright-engine-factory';
import { PuppeteerEngineFactory } from '../engines/puppeteer/puppeteer-engine-factory';
export declare class EngineFactoryService {
    private configService;
    private playwrightFactory;
    private puppeteerFactory;
    private factories;
    private defaultEngine;
    constructor(configService: ConfigService, playwrightFactory: PlaywrightEngineFactory, puppeteerFactory: PuppeteerEngineFactory);
    createEngine(engineType?: EngineType, options?: ScraperOptions): Promise<ScraperEngine>;
    getAvailableEngines(): EngineType[];
    getDefaultEngine(): EngineType;
}
