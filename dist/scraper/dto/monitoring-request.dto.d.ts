import { EngineType } from '../../core/constants/engine-types.enum';
export declare class MonitoringRequestDto {
    url: string;
    selectors: string[];
    duration?: number;
    interval?: number;
    changeTypes?: ('text' | 'attribute' | 'visibility' | 'count' | 'position')[];
    monitorAttributes?: string[];
    onChangeActions?: Array<{
        type: 'screenshot' | 'extract' | 'click' | 'scroll';
        selector?: string;
        path?: string;
        [key: string]: any;
    }>;
    captureScreenshots?: boolean;
    maxChanges?: number;
    engine?: EngineType;
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
