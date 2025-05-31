import { EngineType } from '../../core/constants/engine-types.enum';
export declare class EvaluateRequestDto {
    url: string;
    script: string;
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
