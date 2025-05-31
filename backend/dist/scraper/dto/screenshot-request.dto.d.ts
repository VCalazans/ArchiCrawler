import { EngineType } from '../../core/constants/engine-types.enum';
export declare class ScreenshotRequestDto {
    url: string;
    engine?: EngineType;
    screenshotOptions?: {
        fullPage?: boolean;
        type?: 'png' | 'jpeg';
        quality?: number;
        clip?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        [key: string]: any;
    };
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
