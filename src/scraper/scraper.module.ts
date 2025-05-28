import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { CoreModule } from '../core/core.module';
import { ValidationService } from '../core/utils/validation.service';
import { ScraperLogger } from '../core/utils/scraper-logger';

@Module({
  imports: [CoreModule],
  controllers: [ScraperController],
  providers: [ScraperService, ValidationService, ScraperLogger],
  exports: [ScraperService],
})
export class ScraperModule {}