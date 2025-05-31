import { Observable } from 'rxjs';
import { EngineFactoryService } from '../core/services/engine-factory.service';
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
import { ValidationService } from '../core/utils/validation.service';
import { ScraperLogger } from '../core/utils/scraper-logger';
export declare class ScraperService {
    private readonly engineFactoryService;
    private readonly validationService;
    private readonly scraperLogger;
    private requestCounts;
    private readonly rateLimitWindow;
    private readonly rateLimitMax;
    constructor(engineFactoryService: EngineFactoryService, validationService: ValidationService, scraperLogger: ScraperLogger);
    private checkRateLimit;
    getAvailableEngines(): Promise<{
        availableEngines: EngineType[];
        defaultEngine: EngineType;
    }>;
    extract(request: ScrapeRequestDto): Promise<ScrapeResponseDto>;
    screenshot(request: ScreenshotRequestDto): Promise<{
        buffer: Buffer;
        contentType: string;
    }>;
    pdf(request: PdfRequestDto): Promise<{
        buffer: Buffer;
        contentType: string;
    }>;
    evaluate(request: EvaluateRequestDto): Promise<any>;
    interactWithForm(request: FormInteractionDto): Promise<any>;
    interceptNetwork(request: NetworkInterceptDto): Promise<any>;
    advancedScrape(request: AdvancedScrapeRequestDto): Promise<any>;
    monitor(request: MonitoringRequestDto): Promise<any>;
    monitorStream(url: string, selectors: string[], checkInterval?: number): Observable<any>;
    getAvailableDevices(): Promise<{
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
    private performAction;
    private extractDataByRule;
    private applyTransform;
    private applyTransformSingle;
}
