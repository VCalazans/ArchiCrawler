import { MessageEvent } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { ScraperService } from './scraper.service';
import { ScrapeRequestDto } from './dto/scrape-request.dto';
import { ScrapeResponseDto } from './dto/scrape-response.dto';
import { ScreenshotRequestDto } from './dto/screenshot-request.dto';
import { PdfRequestDto } from './dto/pdf-request.dto';
import { EvaluateRequestDto } from './dto/evaluate-request.dto';
import { FormInteractionDto } from './dto/form-interaction.dto';
import { NetworkInterceptDto } from './dto/network-intercept.dto';
import { AdvancedScrapeRequestDto } from './dto/advanced-scrape-request.dto';
import { MonitoringRequestDto } from './dto/monitoring-request.dto';
import { EngineType } from '../core/constants/engine-types.enum';
export declare class ScraperController {
    private readonly scraperService;
    constructor(scraperService: ScraperService);
    getEngines(): Promise<{
        availableEngines: EngineType[];
        defaultEngine: EngineType;
    }>;
    extract(scrapeRequest: ScrapeRequestDto): Promise<ScrapeResponseDto>;
    screenshot(request: ScreenshotRequestDto, res: Response): Promise<void>;
    pdf(request: PdfRequestDto, res: Response): Promise<void>;
    evaluate(request: EvaluateRequestDto): Promise<ScrapeResponseDto>;
    advancedExtract(request: AdvancedScrapeRequestDto): Promise<any>;
    formInteraction(request: FormInteractionDto): Promise<ScrapeResponseDto>;
    networkIntercept(request: NetworkInterceptDto): Promise<ScrapeResponseDto>;
    monitor(request: MonitoringRequestDto): Promise<ScrapeResponseDto>;
    monitorStream(url: string, selectors: string, interval?: number): Observable<MessageEvent>;
    getDevices(): Promise<{
        devices: {
            viewport: import("playwright-core").ViewportSize;
            userAgent: string;
            deviceScaleFactor: number;
            isMobile: boolean;
            hasTouch: boolean;
            defaultBrowserType: "chromium" | "firefox" | "webkit";
            name: string;
        }[];
        total: number;
    }>;
    batchScrape(request: any): Promise<any>;
}
