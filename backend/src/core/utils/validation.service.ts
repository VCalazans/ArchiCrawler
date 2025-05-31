import { Injectable } from '@nestjs/common';
import { ScrapingError } from './error-handling';

@Injectable()
export class ValidationService {
  
  validateUrl(url: string): void {
    if (!url || typeof url !== 'string') {
      throw new ScrapingError('URL is required and must be a string');
    }

    try {
      const parsedUrl = new URL(url);
      
      // Check for supported protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new ScrapingError(`Unsupported protocol: ${parsedUrl.protocol}. Only HTTP and HTTPS are supported.`);
      }

      // Check for localhost/private IPs in production
      if (process.env.NODE_ENV === 'production') {
        const hostname = parsedUrl.hostname;
        if (this.isPrivateIP(hostname) || hostname === 'localhost') {
          throw new ScrapingError('Access to private networks is not allowed');
        }
      }
    } catch (error) {
      if (error instanceof ScrapingError) {
        throw error;
      }
      throw new ScrapingError(`Invalid URL format: ${url}`);
    }
  }

  validateSelector(selector: string): void {
    if (!selector || typeof selector !== 'string' || selector.trim().length === 0) {
      throw new ScrapingError('Selector is required and must be a non-empty string');
    }

    // Basic CSS selector validation
    try {
      // This will throw if the selector is invalid
      if (typeof document !== 'undefined') {
        document.querySelector(selector);
      }
    } catch (error) {
      throw new ScrapingError(`Invalid CSS selector: ${selector}`);
    }
  }

  validateTimeout(timeout?: number): void {
    if (timeout !== undefined) {
      if (typeof timeout !== 'number' || timeout < 0) {
        throw new ScrapingError('Timeout must be a positive number');
      }
      
      if (timeout > 300000) { // 5 minutes max
        throw new ScrapingError('Timeout cannot exceed 300000ms (5 minutes)');
      }
    }
  }

  validateViewport(width?: number, height?: number): void {
    if (width !== undefined) {
      if (typeof width !== 'number' || width < 1 || width > 7680) {
        throw new ScrapingError('Width must be between 1 and 7680 pixels');
      }
    }

    if (height !== undefined) {
      if (typeof height !== 'number' || height < 1 || height > 4320) {
        throw new ScrapingError('Height must be between 1 and 4320 pixels');
      }
    }
  }

  validateUserAgent(userAgent?: string): void {
    if (userAgent !== undefined) {
      if (typeof userAgent !== 'string' || userAgent.length > 500) {
        throw new ScrapingError('User agent must be a string with maximum 500 characters');
      }
    }
  }

  validateBatchRequest(urls: string[], maxUrls: number = 100): void {
    if (!Array.isArray(urls)) {
      throw new ScrapingError('URLs must be an array');
    }

    if (urls.length === 0) {
      throw new ScrapingError('At least one URL is required');
    }

    if (urls.length > maxUrls) {
      throw new ScrapingError(`Maximum ${maxUrls} URLs allowed per batch request`);
    }

    // Validate each URL
    urls.forEach((url, index) => {
      try {
        this.validateUrl(url);
      } catch (error) {
        throw new ScrapingError(`Invalid URL at index ${index}: ${error.message}`);
      }
    });
  }

  validateExtractionRules(rules: any[]): void {
    if (!Array.isArray(rules)) {
      throw new ScrapingError('Extraction rules must be an array');
    }

    if (rules.length === 0) {
      throw new ScrapingError('At least one extraction rule is required');
    }

    rules.forEach((rule, index) => {
      if (!rule.name || typeof rule.name !== 'string') {
        throw new ScrapingError(`Rule at index ${index} must have a valid name`);
      }

      if (!rule.selector || typeof rule.selector !== 'string') {
        throw new ScrapingError(`Rule "${rule.name}" must have a valid selector`);
      }

      this.validateSelector(rule.selector);
    });
  }

  validateFormFields(fields: any[]): void {
    if (!Array.isArray(fields)) {
      throw new ScrapingError('Form fields must be an array');
    }

    if (fields.length === 0) {
      throw new ScrapingError('At least one form field is required');
    }

    const validActions = ['fill', 'click', 'select', 'check', 'uncheck', 'upload'];

    fields.forEach((field, index) => {
      if (!field.selector || typeof field.selector !== 'string') {
        throw new ScrapingError(`Field at index ${index} must have a valid selector`);
      }

      if (!field.action || !validActions.includes(field.action)) {
        throw new ScrapingError(`Field at index ${index} must have a valid action: ${validActions.join(', ')}`);
      }

      this.validateSelector(field.selector);
    });
  }

  validateMonitoringRequest(selectors: string[], duration?: number, interval?: number): void {
    if (!Array.isArray(selectors) || selectors.length === 0) {
      throw new ScrapingError('At least one selector is required for monitoring');
    }

    selectors.forEach(selector => {
      this.validateSelector(selector);
    });

    if (duration !== undefined) {
      if (typeof duration !== 'number' || duration < 1000 || duration > 3600000) {
        throw new ScrapingError('Monitoring duration must be between 1 second and 1 hour');
      }
    }

    if (interval !== undefined) {
      if (typeof interval !== 'number' || interval < 500 || interval > 60000) {
        throw new ScrapingError('Monitoring interval must be between 500ms and 1 minute');
      }
    }
  }

  validateFormInteraction(request: any): void {
    this.validateUrl(request.url);
    this.validateFormFields(request.fields);
    
    if (request.submitSelector) {
      this.validateSelector(request.submitSelector);
    }
  }

  validateAdvancedScrapeRequest(request: any): void {
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
      throw new ScrapingError('Maximum 50 pages allowed for pagination');
    }
  }

  private isPrivateIP(hostname: string): boolean {
    // Check for private IP ranges
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
}
