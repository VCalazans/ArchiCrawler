export declare class ValidationService {
    validateUrl(url: string): void;
    validateSelector(selector: string): void;
    validateTimeout(timeout?: number): void;
    validateViewport(width?: number, height?: number): void;
    validateUserAgent(userAgent?: string): void;
    validateBatchRequest(urls: string[], maxUrls?: number): void;
    validateExtractionRules(rules: any[]): void;
    validateFormFields(fields: any[]): void;
    validateMonitoringRequest(selectors: string[], duration?: number, interval?: number): void;
    validateFormInteraction(request: any): void;
    validateAdvancedScrapeRequest(request: any): void;
    private isPrivateIP;
}
