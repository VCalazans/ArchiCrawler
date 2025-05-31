import { EngineType } from '../../core/constants/engine-types.enum';
export declare class FormFieldDto {
    selector: string;
    action: 'fill' | 'click' | 'select' | 'check' | 'uncheck' | 'upload';
    value?: string | string[] | boolean;
    waitAfter?: number;
}
export declare class FormInteractionDto {
    url: string;
    fields: FormFieldDto[];
    submitSelector?: string;
    waitForNavigation?: boolean;
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
