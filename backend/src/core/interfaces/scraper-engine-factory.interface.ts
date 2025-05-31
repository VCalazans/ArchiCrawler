import { ScraperEngine } from './scraper-engine.interface';
import { ScraperOptions } from './scraper-options.interface';

export interface ScraperEngineFactory {
  /**
   * Create a new scraper engine instance
   * @param options Scraper engine options
   */
  create(options?: ScraperOptions): Promise<ScraperEngine>;
}