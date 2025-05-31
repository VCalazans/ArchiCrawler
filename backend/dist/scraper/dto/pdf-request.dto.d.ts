import { EngineType } from '../../core/constants/engine-types.enum';
export declare class PdfRequestDto {
    url: string;
    engine?: EngineType;
    pdfOptions?: {
        format?: string;
        width?: string | number;
        height?: string | number;
        printBackground?: boolean;
        margin?: {
            top?: string | number;
            right?: string | number;
            bottom?: string | number;
            left?: string | number;
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
