import { EngineType } from '../../core/constants/engine-types.enum';
export declare class ScrapeRequestDto {
    url: string;
    selector?: string;
    engine?: EngineType;
    waitForSelector?: string;
    options?: {
        headless?: boolean;
        timeout?: number;
        userAgent?: string;
        width?: number;
        height?: number;
        ignoreHTTPSErrors?: boolean;
        [key: string]: any;
    };
}
