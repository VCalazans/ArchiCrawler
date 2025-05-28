"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ScraperLogger_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperLogger = void 0;
const common_1 = require("@nestjs/common");
let ScraperLogger = ScraperLogger_1 = class ScraperLogger {
    constructor() {
        this.logger = new common_1.Logger(ScraperLogger_1.name);
    }
    logRequest(method, url, engine, options) {
        this.logger.log(`[${method}] ${url} using ${engine}`, {
            method,
            url,
            engine,
            options: this.sanitizeOptions(options),
        });
    }
    logSuccess(method, url, timeTaken, dataSize) {
        this.logger.log(`[${method}] ✓ ${url} completed in ${timeTaken}ms`, {
            method,
            url,
            timeTaken,
            dataSize,
            status: 'success',
        });
    }
    logError(method, url, error, timeTaken) {
        this.logger.error(`[${method}] ✗ ${url} failed: ${error.message}`, {
            method,
            url,
            error: error.message,
            stack: error.stack,
            timeTaken,
            status: 'error',
        });
    }
    logWarning(method, message, context) {
        this.logger.warn(`[${method}] ${message}`, context);
    }
    logRateLimit(identifier, limit, window) {
        this.logger.warn(`Rate limit exceeded for ${identifier}: ${limit} requests per ${window}ms`, {
            identifier,
            limit,
            window,
            type: 'rate_limit',
        });
    }
    logBatchOperation(operation, totalUrls, successful, failed, timeTaken) {
        this.logger.log(`[${operation}] Batch completed: ${successful}/${totalUrls} successful, ${failed} failed in ${timeTaken}ms`, {
            operation,
            totalUrls,
            successful,
            failed,
            timeTaken,
            successRate: (successful / totalUrls) * 100,
        });
    }
    sanitizeOptions(options) {
        if (!options)
            return undefined;
        const sanitized = { ...options };
        if (sanitized.httpCredentials) {
            sanitized.httpCredentials = { username: '***', password: '***' };
        }
        if (sanitized.proxy && sanitized.proxy.password) {
            sanitized.proxy = { ...sanitized.proxy, password: '***' };
        }
        return sanitized;
    }
};
exports.ScraperLogger = ScraperLogger;
exports.ScraperLogger = ScraperLogger = ScraperLogger_1 = __decorate([
    (0, common_1.Injectable)()
], ScraperLogger);
//# sourceMappingURL=scraper-logger.js.map