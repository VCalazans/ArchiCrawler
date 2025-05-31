import { EngineType } from '../../core/constants/engine-types.enum';
export declare class DataExtractionRule {
    name: string;
    selector: string;
    extractType?: 'text' | 'html' | 'attribute' | 'property' | 'count';
    attributeName?: string;
    propertyName?: string;
    multiple?: boolean;
    transform?: 'trim' | 'uppercase' | 'lowercase' | 'parseNumber' | 'parseDate' | 'removeWhitespace';
    defaultValue?: any;
    regex?: string;
    regexFlags?: string;
}
export declare class AdvancedScrapeRequestDto {
    url: string;
    extractionRules: DataExtractionRule[];
    waitConditions?: {
        selector?: string;
        timeout?: number;
        waitFor?: 'visible' | 'hidden' | 'attached' | 'detached';
        networkIdle?: boolean;
    };
    preActions?: Array<{
        type: 'click' | 'scroll' | 'wait' | 'type' | 'hover' | 'press';
        selector?: string;
        value?: string;
        duration?: number;
        key?: string;
    }>;
    pagination?: {
        nextButtonSelector: string;
        maxPages?: number;
        waitBetweenPages?: number;
        stopCondition?: string;
    };
    screenshot?: {
        enabled: boolean;
        fullPage?: boolean;
        type?: 'png' | 'jpeg';
        quality?: number;
        path?: string;
    };
    engine?: EngineType;
    options?: {
        headless?: boolean;
        timeout?: number;
        userAgent?: string;
        width?: number;
        height?: number;
        ignoreHTTPSErrors?: boolean;
        device?: string;
        geolocation?: {
            latitude: number;
            longitude: number;
        };
        blockResources?: string[];
        [key: string]: any;
    };
}
