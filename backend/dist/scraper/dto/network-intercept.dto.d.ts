import { EngineType } from '../../core/constants/engine-types.enum';
export declare class NetworkInterceptDto {
    url: string;
    interceptPatterns?: string[];
    blockResources?: string[];
    captureData?: boolean;
    monitorDuration?: number;
    actions?: Array<{
        type: 'click' | 'scroll' | 'wait' | 'type' | 'navigate';
        selector?: string;
        value?: string;
        duration?: number;
        url?: string;
    }>;
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
