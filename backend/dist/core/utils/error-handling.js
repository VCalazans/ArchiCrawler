"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = exports.SelectorError = exports.NavigationError = exports.TimeoutError = exports.ScrapingError = void 0;
exports.handleScrapingError = handleScrapingError;
exports.validateUrl = validateUrl;
exports.validateSelector = validateSelector;
exports.retryOperation = retryOperation;
const common_1 = require("@nestjs/common");
class ScrapingError extends Error {
    constructor(message, url, selector, originalError) {
        super(message);
        this.url = url;
        this.selector = selector;
        this.originalError = originalError;
        this.name = 'ScrapingError';
    }
}
exports.ScrapingError = ScrapingError;
class TimeoutError extends ScrapingError {
    constructor(url, timeout) {
        super(`Request timeout after ${timeout}ms`, url);
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
class NavigationError extends ScrapingError {
    constructor(url, originalError) {
        super(`Failed to navigate to ${url}`, url, undefined, originalError);
        this.name = 'NavigationError';
    }
}
exports.NavigationError = NavigationError;
class SelectorError extends ScrapingError {
    constructor(selector, url) {
        super(`Selector "${selector}" not found`, url, selector);
        this.name = 'SelectorError';
    }
}
exports.SelectorError = SelectorError;
class RateLimitError extends ScrapingError {
    constructor(message = 'Rate limit exceeded') {
        super(message);
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
function handleScrapingError(error, url, selector) {
    if (error instanceof ScrapingError) {
        throw new common_1.HttpException({
            status: 'error',
            message: error.message,
            url: error.url || url,
            selector: error.selector || selector,
            type: error.name,
        }, common_1.HttpStatus.BAD_REQUEST);
    }
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        throw new common_1.HttpException({
            status: 'error',
            message: 'Request timeout',
            url,
            selector,
            type: 'TimeoutError',
        }, common_1.HttpStatus.REQUEST_TIMEOUT);
    }
    if (error.message.includes('net::ERR') || error.message.includes('Failed to navigate')) {
        throw new common_1.HttpException({
            status: 'error',
            message: 'Navigation failed',
            url,
            type: 'NavigationError',
        }, common_1.HttpStatus.BAD_REQUEST);
    }
    throw new common_1.HttpException({
        status: 'error',
        message: error.message || 'Unknown scraping error',
        url,
        selector,
        type: 'ScrapingError',
    }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
}
function validateUrl(url) {
    try {
        new URL(url);
    }
    catch {
        throw new ScrapingError(`Invalid URL: ${url}`);
    }
}
function validateSelector(selector) {
    if (!selector || typeof selector !== 'string' || selector.trim().length === 0) {
        throw new ScrapingError('Invalid selector: must be a non-empty string');
    }
}
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (i === maxRetries) {
                throw lastError;
            }
            const waitTime = delay * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    throw lastError;
}
//# sourceMappingURL=error-handling.js.map