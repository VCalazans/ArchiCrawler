import { HttpException, HttpStatus } from '@nestjs/common';

export class ScrapingError extends Error {
  constructor(
    message: string,
    public readonly url?: string,
    public readonly selector?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ScrapingError';
  }
}

export class TimeoutError extends ScrapingError {
  constructor(url?: string, timeout?: number) {
    super(`Request timeout after ${timeout}ms`, url);
    this.name = 'TimeoutError';
  }
}

export class NavigationError extends ScrapingError {
  constructor(url: string, originalError?: Error) {
    super(`Failed to navigate to ${url}`, url, undefined, originalError);
    this.name = 'NavigationError';
  }
}

export class SelectorError extends ScrapingError {
  constructor(selector: string, url?: string) {
    super(`Selector "${selector}" not found`, url, selector);
    this.name = 'SelectorError';
  }
}

export class RateLimitError extends ScrapingError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export function handleScrapingError(error: any, url?: string, selector?: string): never {
  if (error instanceof ScrapingError) {
    throw new HttpException(
      {
        status: 'error',
        message: error.message,
        url: error.url || url,
        selector: error.selector || selector,
        type: error.name,
      },
      HttpStatus.BAD_REQUEST
    );
  }

  if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
    throw new HttpException(
      {
        status: 'error',
        message: 'Request timeout',
        url,
        selector,
        type: 'TimeoutError',
      },
      HttpStatus.REQUEST_TIMEOUT
    );
  }

  if (error.message.includes('net::ERR') || error.message.includes('Failed to navigate')) {
    throw new HttpException(
      {
        status: 'error',
        message: 'Navigation failed',
        url,
        type: 'NavigationError',
      },
      HttpStatus.BAD_REQUEST
    );
  }

  // Generic error
  throw new HttpException(
    {
      status: 'error',
      message: error.message || 'Unknown scraping error',
      url,
      selector,
      type: 'ScrapingError',
    },
    HttpStatus.INTERNAL_SERVER_ERROR
  );
}

export function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new ScrapingError(`Invalid URL: ${url}`);
  }
}

export function validateSelector(selector: string): void {
  if (!selector || typeof selector !== 'string' || selector.trim().length === 0) {
    throw new ScrapingError('Invalid selector: must be a non-empty string');
  }
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
}
