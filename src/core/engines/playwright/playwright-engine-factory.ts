import { Injectable } from '@nestjs/common';
import { ScraperEngineFactory } from '../../interfaces/scraper-engine-factory.interface';
import { ScraperEngine } from '../../interfaces/scraper-engine.interface';
import { ScraperOptions } from '../../interfaces/scraper-options.interface';
import { PlaywrightEngine } from './playwright-engine';

@Injectable()
export class PlaywrightEngineFactory implements ScraperEngineFactory {
  async create(options?: ScraperOptions): Promise<ScraperEngine> {
    const engine = new PlaywrightEngine(options);
    await engine.initialize();
    return engine;
  }
}