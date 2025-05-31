import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ScraperLogger {
  private readonly logger = new Logger(ScraperLogger.name);

  logRequest(method: string, url: string, engine: string, options?: any): void {
    this.logger.log(`[${method}] ${url} using ${engine}`, {
      method,
      url,
      engine,
      options: this.sanitizeOptions(options),
    });
  }

  logSuccess(method: string, url: string, timeTaken: number, dataSize?: number): void {
    this.logger.log(`[${method}] ✓ ${url} completed in ${timeTaken}ms`, {
      method,
      url,
      timeTaken,
      dataSize,
      status: 'success',
    });
  }

  logError(method: string, url: string, error: Error, timeTaken?: number): void {
    this.logger.error(`[${method}] ✗ ${url} failed: ${error.message}`, {
      method,
      url,
      error: error.message,
      stack: error.stack,
      timeTaken,
      status: 'error',
    });
  }

  logWarning(method: string, message: string, context?: any): void {
    this.logger.warn(`[${method}] ${message}`, context);
  }

  logRateLimit(identifier: string, limit: number, window: number): void {
    this.logger.warn(`Rate limit exceeded for ${identifier}: ${limit} requests per ${window}ms`, {
      identifier,
      limit,
      window,
      type: 'rate_limit',
    });
  }

  logBatchOperation(operation: string, totalUrls: number, successful: number, failed: number, timeTaken: number): void {
    this.logger.log(`[${operation}] Batch completed: ${successful}/${totalUrls} successful, ${failed} failed in ${timeTaken}ms`, {
      operation,
      totalUrls,
      successful,
      failed,
      timeTaken,
      successRate: (successful / totalUrls) * 100,
    });
  }

  private sanitizeOptions(options?: any): any {
    if (!options) return undefined;
    
    const sanitized = { ...options };
    
    // Remove sensitive information
    if (sanitized.httpCredentials) {
      sanitized.httpCredentials = { username: '***', password: '***' };
    }
    
    if (sanitized.proxy && sanitized.proxy.password) {
      sanitized.proxy = { ...sanitized.proxy, password: '***' };
    }
    
    return sanitized;
  }
}
