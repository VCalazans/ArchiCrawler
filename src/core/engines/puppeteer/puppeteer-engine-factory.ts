import { Injectable } from '@nestjs/common';
import { ScraperEngineFactory } from '../../interfaces/scraper-engine-factory.interface';
import { ScraperEngine } from '../../interfaces/scraper-engine.interface';
import { ScraperOptions } from '../../interfaces/scraper-options.interface';
import { PuppeteerEngine } from './puppeteer-engine';

@Injectable()
export class PuppeteerEngineFactory implements ScraperEngineFactory {
  async create(options?: ScraperOptions): Promise<ScraperEngine> {
    const engine = new PuppeteerEngine(options);
    await engine.initialize();
    return engine;
  }
}