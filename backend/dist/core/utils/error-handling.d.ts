export declare class ScrapingError extends Error {
    readonly url?: string;
    readonly selector?: string;
    readonly originalError?: Error;
    constructor(message: string, url?: string, selector?: string, originalError?: Error);
}
export declare class TimeoutError extends ScrapingError {
    constructor(url?: string, timeout?: number);
}
export declare class NavigationError extends ScrapingError {
    constructor(url: string, originalError?: Error);
}
export declare class SelectorError extends ScrapingError {
    constructor(selector: string, url?: string);
}
export declare class RateLimitError extends ScrapingError {
    constructor(message?: string);
}
export declare function handleScrapingError(error: any, url?: string, selector?: string): never;
export declare function validateUrl(url: string): void;
export declare function validateSelector(selector: string): void;
export declare function retryOperation<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
