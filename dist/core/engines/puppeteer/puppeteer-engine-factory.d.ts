import { ScraperEngineFactory } from '../../interfaces/scraper-engine-factory.interface';
import { ScraperEngine } from '../../interfaces/scraper-engine.interface';
import { ScraperOptions } from '../../interfaces/scraper-options.interface';
export declare class PuppeteerEngineFactory implements ScraperEngineFactory {
    create(options?: ScraperOptions): Promise<ScraperEngine>;
}
