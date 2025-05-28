"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const common_1 = require("@nestjs/common");
const error_handling_1 = require("./error-handling");
let ValidationService = class ValidationService {
    validateUrl(url) {
        if (!url || typeof url !== 'string') {
            throw new error_handling_1.ScrapingError('URL is required and must be a string');
        }
        try {
            const parsedUrl = new URL(url);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new error_handling_1.ScrapingError(`Unsupported protocol: ${parsedUrl.protocol}. Only HTTP and HTTPS are supported.`);
            }
            if (process.env.NODE_ENV === 'production') {
                const hostname = parsedUrl.hostname;
                if (this.isPrivateIP(hostname) || hostname === 'localhost') {
                    throw new error_handling_1.ScrapingError('Access to private networks is not allowed');
                }
            }
        }
        catch (error) {
            if (error instanceof error_handling_1.ScrapingError) {
                throw error;
            }
            throw new error_handling_1.ScrapingError(`Invalid URL format: ${url}`);
        }
    }
    validateSelector(selector) {
        if (!selector || typeof selector !== 'string' || selector.trim().length === 0) {
            throw new error_handling_1.ScrapingError('Selector is required and must be a non-empty string');
        }
        try {
            if (typeof document !== 'undefined') {
                document.querySelector(selector);
            }
        }
        catch (error) {
            throw new error_handling_1.ScrapingError(`Invalid CSS selector: ${selector}`);
        }
    }
    validateTimeout(timeout) {
        if (timeout !== undefined) {
            if (typeof timeout !== 'number' || timeout < 0) {
                throw new error_handling_1.ScrapingError('Timeout must be a positive number');
            }
            if (timeout > 300000) {
                throw new error_handling_1.ScrapingError('Timeout cannot exceed 300000ms (5 minutes)');
            }
        }
    }
    validateViewport(width, height) {
        if (width !== undefined) {
            if (typeof width !== 'number' || width < 1 || width > 7680) {
                throw new error_handling_1.ScrapingError('Width must be between 1 and 7680 pixels');
            }
        }
        if (height !== undefined) {
            if (typeof height !== 'number' || height < 1 || height > 4320) {
                throw new error_handling_1.ScrapingError('Height must be between 1 and 4320 pixels');
            }
        }
    }
    validateUserAgent(userAgent) {
        if (userAgent !== undefined) {
            if (typeof userAgent !== 'string' || userAgent.length > 500) {
                throw new error_handling_1.ScrapingError('User agent must be a string with maximum 500 characters');
            }
        }
    }
    validateBatchRequest(urls, maxUrls = 100) {
        if (!Array.isArray(urls)) {
            throw new error_handling_1.ScrapingError('URLs must be an array');
        }
        if (urls.length === 0) {
            throw new error_handling_1.ScrapingError('At least one URL is required');
        }
        if (urls.length > maxUrls) {
            throw new error_handling_1.ScrapingError(`Maximum ${maxUrls} URLs allowed per batch request`);
        }
        urls.forEach((url, index) => {
            try {
                this.validateUrl(url);
            }
            catch (error) {
                throw new error_handling_1.ScrapingError(`Invalid URL at index ${index}: ${error.message}`);
            }
        });
    }
    validateExtractionRules(rules) {
        if (!Array.isArray(rules)) {
            throw new error_handling_1.ScrapingError('Extraction rules must be an array');
        }
        if (rules.length === 0) {
            throw new error_handling_1.ScrapingError('At least one extraction rule is required');
        }
        rules.forEach((rule, index) => {
            if (!rule.name || typeof rule.name !== 'string') {
                throw new error_handling_1.ScrapingError(`Rule at index ${index} must have a valid name`);
            }
            if (!rule.selector || typeof rule.selector !== 'string') {
                throw new error_handling_1.ScrapingError(`Rule "${rule.name}" must have a valid selector`);
            }
            this.validateSelector(rule.selector);
        });
    }
    validateFormFields(fields) {
        if (!Array.isArray(fields)) {
            throw new error_handling_1.ScrapingError('Form fields must be an array');
        }
        if (fields.length === 0) {
            throw new error_handling_1.ScrapingError('At least one form field is required');
        }
        const validActions = ['fill', 'click', 'select', 'check', 'uncheck', 'upload'];
        fields.forEach((field, index) => {
            if (!field.selector || typeof field.selector !== 'string') {
                throw new error_handling_1.ScrapingError(`Field at index ${index} must have a valid selector`);
            }
            if (!field.action || !validActions.includes(field.action)) {
                throw new error_handling_1.ScrapingError(`Field at index ${index} must have a valid action: ${validActions.join(', ')}`);
            }
            this.validateSelector(field.selector);
        });
    }
    validateMonitoringRequest(selectors, duration, interval) {
        if (!Array.isArray(selectors) || selectors.length === 0) {
            throw new error_handling_1.ScrapingError('At least one selector is required for monitoring');
        }
        selectors.forEach(selector => {
            this.validateSelector(selector);
        });
        if (duration !== undefined) {
            if (typeof duration !== 'number' || duration < 1000 || duration > 3600000) {
                throw new error_handling_1.ScrapingError('Monitoring duration must be between 1 second and 1 hour');
            }
        }
        if (interval !== undefined) {
            if (typeof interval !== 'number' || interval < 500 || interval > 60000) {
                throw new error_handling_1.ScrapingError('Monitoring interval must be between 500ms and 1 minute');
            }
        }
    }
    validateFormInteraction(request) {
        this.validateUrl(request.url);
        this.validateFormFields(request.fields);
        if (request.submitSelector) {
            this.validateSelector(request.submitSelector);
        }
    }
    validateAdvancedScrapeRequest(request) {
        this.validateUrl(request.url);
        if (request.extractionRules) {
            this.validateExtractionRules(request.extractionRules);
        }
        if (request.waitConditions?.selector) {
            this.validateSelector(request.waitConditions.selector);
        }
        if (request.waitConditions?.timeout) {
            this.validateTimeout(request.waitConditions.timeout);
        }
        if (request.pagination?.maxPages && typeof request.pagination.maxPages === 'number' && request.pagination.maxPages > 50) {
            throw new error_handling_1.ScrapingError('Maximum 50 pages allowed for pagination');
        }
    }
    isPrivateIP(hostname) {
        const privateIPRanges = [
            /^10\./,
            /^192\.168\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^127\./,
            /^169\.254\./,
            /^::1$/,
            /^fc00:/,
            /^fe80:/
        ];
        return privateIPRanges.some(range => range.test(hostname));
    }
};
exports.ValidationService = ValidationService;
exports.ValidationService = ValidationService = __decorate([
    (0, common_1.Injectable)()
], ValidationService);
//# sourceMappingURL=validation.service.js.map