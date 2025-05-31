import { ScraperEngine } from './scraper-engine.interface';
import { ScraperOptions } from './scraper-options.interface';
export interface ScraperEngineFactory {
    create(options?: ScraperOptions): Promise<ScraperEngine>;
}
