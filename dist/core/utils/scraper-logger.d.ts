export declare class ScraperLogger {
    private readonly logger;
    logRequest(method: string, url: string, engine: string, options?: any): void;
    logSuccess(method: string, url: string, timeTaken: number, dataSize?: number): void;
    logError(method: string, url: string, error: Error, timeTaken?: number): void;
    logWarning(method: string, message: string, context?: any): void;
    logRateLimit(identifier: string, limit: number, window: number): void;
    logBatchOperation(operation: string, totalUrls: number, successful: number, failed: number, timeTaken: number): void;
    private sanitizeOptions;
}
