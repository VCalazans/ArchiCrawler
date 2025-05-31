import { Injectable } from '@nestjs/common';
import { Observable, Subject, interval } from 'rxjs';
import { EngineFactoryService } from '../core/services/engine-factory.service';
import { ScrapeRequestDto } from './dto/scrape-request.dto';
import { ScrapeResponseDto } from './dto/scrape-response.dto';
import { ScreenshotRequestDto } from './dto/screenshot-request.dto';
import { PdfRequestDto } from './dto/pdf-request.dto';
import { EvaluateRequestDto } from './dto/evaluate-request.dto';
import { FormInteractionDto, FormFieldDto } from './dto/form-interaction.dto';
import { NetworkInterceptDto } from './dto/network-intercept.dto';
import { AdvancedScrapeRequestDto, DataExtractionRule } from './dto/advanced-scrape-request.dto';
import { MonitoringRequestDto } from './dto/monitoring-request.dto';
import { EngineType } from '../core/constants/engine-types.enum';
import { devices } from 'playwright';
import { ValidationService } from '../core/utils/validation.service';
import { ScraperLogger } from '../core/utils/scraper-logger';
import { 
  handleScrapingError, 
  retryOperation, 
  ScrapingError, 
  RateLimitError 
} from '../core/utils/error-handling';

@Injectable()
export class ScraperService {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly rateLimitWindow = 60000; // 1 minute
  private readonly rateLimitMax = 100; // 100 requests per minute

  constructor(
    private readonly engineFactoryService: EngineFactoryService,
    private readonly validationService: ValidationService,
    private readonly scraperLogger: ScraperLogger,
  ) {}

  private checkRateLimit(identifier: string): void {
    const now = Date.now();
    const userLimits = this.requestCounts.get(identifier);

    if (!userLimits || now > userLimits.resetTime) {
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + this.rateLimitWindow,
      });
      return;
    }

    if (userLimits.count >= this.rateLimitMax) {
      this.scraperLogger.logRateLimit(identifier, this.rateLimitMax, this.rateLimitWindow);
      throw new RateLimitError(`Rate limit exceeded: ${this.rateLimitMax} requests per minute`);
    }

    userLimits.count++;
  }

  async getAvailableEngines() {
    return {
      availableEngines: this.engineFactoryService.getAvailableEngines(),
      defaultEngine: this.engineFactoryService.getDefaultEngine(),
    };
  }

  async extract(request: ScrapeRequestDto): Promise<ScrapeResponseDto> {
    const startTime = Date.now();
    let engine;
    
    try {
      this.checkRateLimit(request.url);
      this.validationService.validateUrl(request.url);
      
      if (request.selector) {
        this.validationService.validateSelector(request.selector);
      }
      
      this.scraperLogger.logRequest('EXTRACT', request.url, request.engine || 'default', request.options);
      
      engine = await this.engineFactoryService.createEngine(
        request.engine,
        request.options,
      );
      
      const result = await retryOperation(async () => {
        await engine.goto(request.url);
        
        if (request.waitForSelector) {
          await engine.waitForSelector(request.waitForSelector);
        }
        
        const data = request.selector
          ? await engine.getText(request.selector)
          : await engine.evaluate(() => document.documentElement.outerHTML);
        
        return data;
      }, 3, 1000);
      
      const timeTaken = Date.now() - startTime;
      const dataSize = JSON.stringify(result).length;
      
      this.scraperLogger.logSuccess('EXTRACT', request.url, timeTaken, dataSize);
      
      return {
        status: 'success',
        data: result,
        url: request.url,
        timeTaken,
        engine: request.engine || this.engineFactoryService.getDefaultEngine(),
      };
    } catch (error) {
      const timeTaken = Date.now() - startTime;
      this.scraperLogger.logError('EXTRACT', request.url, error as Error, timeTaken);
      throw handleScrapingError(error, request.url, request.selector);
    } finally {
      if (engine) {
        await engine.close().catch(err => 
          this.scraperLogger.logWarning('EXTRACT', 'Failed to close engine', { error: err.message })
        );
      }
    }
  }

  async screenshot(request: ScreenshotRequestDto): Promise<{ buffer: Buffer; contentType: string }> {
    const startTime = Date.now();
    let engine;
    
    try {
      this.checkRateLimit(request.url);
      this.validationService.validateUrl(request.url);
      
      this.scraperLogger.logRequest('SCREENSHOT', request.url, request.engine || 'default', request.options);
      
      engine = await this.engineFactoryService.createEngine(
        request.engine,
        request.options,
      );
      
      const result = await retryOperation(async () => {
        await engine.goto(request.url);
        
        // Wait for selector if specified in screenshot options
        if (request.screenshotOptions?.waitForSelector) {
          await engine.waitForSelector(request.screenshotOptions.waitForSelector);
        }
        
        const options = {
          type: 'png' as const,
          fullPage: false,
          ...request.screenshotOptions,
        };
        
        return await engine.screenshot(options);
      }, 3, 1000);
      
      const timeTaken = Date.now() - startTime;
      this.scraperLogger.logSuccess('SCREENSHOT', request.url, timeTaken, result.length);
      
      return {
        buffer: Buffer.from(result),
        contentType: 'image/png',
      };
    } catch (error) {      const timeTaken = Date.now() - startTime;
      this.scraperLogger.logError('SCREENSHOT', request.url, error as Error, timeTaken);
      throw handleScrapingError(error, request.url);
    } finally {
      if (engine) {
        await engine.close().catch(err => 
          this.scraperLogger.logWarning('SCREENSHOT', 'Failed to close engine', { error: err.message })
        );
      }
    }
  }

  async pdf(request: PdfRequestDto): Promise<{ buffer: Buffer; contentType: string }> {
    const startTime = Date.now();
    let engine;
    
    try {
      this.checkRateLimit(request.url);
      this.validationService.validateUrl(request.url);
      
      this.scraperLogger.logRequest('PDF', request.url, request.engine || 'default', request.options);
      
      engine = await this.engineFactoryService.createEngine(
        request.engine,
        request.options,
      );
      
      const result = await retryOperation(async () => {
        await engine.goto(request.url);
        
        // Wait for selector if specified in PDF options
        if (request.pdfOptions?.waitForSelector) {
          await engine.waitForSelector(request.pdfOptions.waitForSelector);
        }
        
        const options = {
          format: 'A4' as const,
          printBackground: true,
          ...request.pdfOptions,
        };
        
        return await engine.pdf(options);
      }, 3, 1000);
      
      const timeTaken = Date.now() - startTime;
      this.scraperLogger.logSuccess('PDF', request.url, timeTaken, result.length);
      
      return {
        buffer: Buffer.from(result),
        contentType: 'application/pdf',
      };
    } catch (error) {      const timeTaken = Date.now() - startTime;
      this.scraperLogger.logError('PDF', request.url, error as Error, timeTaken);
      throw handleScrapingError(error, request.url);
    } finally {
      if (engine) {
        await engine.close().catch(err => 
          this.scraperLogger.logWarning('PDF', 'Failed to close engine', { error: err.message })
        );
      }
    }
  }

  async evaluate(request: EvaluateRequestDto): Promise<any> {
    const startTime = Date.now();
    let engine;
    
    try {
      this.checkRateLimit(request.url);
      this.validationService.validateUrl(request.url);
      
      this.scraperLogger.logRequest('EVALUATE', request.url, request.engine || 'default', request.options);
      
      engine = await this.engineFactoryService.createEngine(
        request.engine,
        request.options,
      );
      
      const result = await retryOperation(async () => {
        await engine.goto(request.url);
        
        // Wait for selector if specified in options
        if (request.options?.waitForSelector) {
          await engine.waitForSelector(request.options.waitForSelector);
        }
        
        return await engine.evaluate(request.script);
      }, 3, 1000);
      
      const timeTaken = Date.now() - startTime;
      const dataSize = JSON.stringify(result).length;
      
      this.scraperLogger.logSuccess('EVALUATE', request.url, timeTaken, dataSize);
      
      return result;
    } catch (error) {      const timeTaken = Date.now() - startTime;
      this.scraperLogger.logError('EVALUATE', request.url, error as Error, timeTaken);
      throw handleScrapingError(error, request.url);
    } finally {
      if (engine) {
        await engine.close().catch(err => 
          this.scraperLogger.logWarning('EVALUATE', 'Failed to close engine', { error: err.message })
        );
      }
    }
  }

  async interactWithForm(request: FormInteractionDto): Promise<any> {
    const startTime = Date.now();
    let engine;
    
    try {
      this.checkRateLimit(request.url);
      this.validationService.validateFormInteraction(request);
      
      this.scraperLogger.logRequest('FORM_INTERACTION', request.url, request.engine || 'default', request.options);
      
      engine = await this.engineFactoryService.createEngine(
        request.engine,
        request.options,
      );
      
      const result = await retryOperation(async () => {
        await engine.goto(request.url);
        
        // Fill form fields
        for (const field of request.fields) {
          await engine.waitForSelector(field.selector);
          
          switch (field.action) {
            case 'fill':
              await engine.clear(field.selector);
              await engine.type(field.selector, field.value as string);
              break;
            case 'click':
              await engine.click(field.selector);
              break;
            case 'select':
              await engine.selectOption(field.selector, field.value as string);
              break;
            case 'check':
              await engine.check(field.selector);
              break;
            case 'uncheck':
              await engine.uncheck(field.selector);
              break;
            case 'upload':
              if (field.value && Array.isArray(field.value)) {
                await engine.uploadFile(field.selector, field.value as string[]);
              }
              break;
          }
          
          if (field.waitAfter) {
            await engine.wait(field.waitAfter);
          }
        }
        
        // Submit form if requested
        if (request.submitSelector) {
          await engine.click(request.submitSelector);
          
          // Wait for navigation if expected
          if (request.waitForNavigation) {
            await engine.waitForLoadState('networkidle');
          }
        }
        
        return { success: true };
      }, 3, 1000);
      
      const timeTaken = Date.now() - startTime;
      const dataSize = JSON.stringify(result).length;
      
      this.scraperLogger.logSuccess('FORM_INTERACTION', request.url, timeTaken, dataSize);
      
      return result;
    } catch (error) {      const timeTaken = Date.now() - startTime;
      this.scraperLogger.logError('FORM_INTERACTION', request.url, error as Error, timeTaken);
      throw handleScrapingError(error, request.url);
    } finally {
      if (engine) {
        await engine.close().catch(err => 
          this.scraperLogger.logWarning('FORM_INTERACTION', 'Failed to close engine', { error: err.message })
        );
      }
    }
  }

  async interceptNetwork(request: NetworkInterceptDto): Promise<any> {
    const startTime = Date.now();
    let engine;
    
    try {
      this.checkRateLimit(request.url);
      this.validationService.validateUrl(request.url);
      
      this.scraperLogger.logRequest('NETWORK_INTERCEPT', request.url, request.engine || 'default', request.options);
      
      engine = await this.engineFactoryService.createEngine(
        request.engine,
        request.options,
      );
      
      const result = await retryOperation(async () => {
        const interceptedRequests: any[] = [];
        const interceptedResponses: any[] = [];
        
        // Set up request interception if patterns provided
        if (request.interceptPatterns && request.interceptPatterns.length > 0) {
          await engine.setRequestInterception(true, (interceptedRequest: any) => {
            const url = interceptedRequest.url();
            const shouldIntercept = request.interceptPatterns!.some(pattern => 
              url.includes(pattern) || new RegExp(pattern.replace(/\*/g, '.*')).test(url)
            );
            
            if (shouldIntercept && request.captureData) {
              interceptedRequests.push({
                url: url,
                method: interceptedRequest.method(),
                headers: interceptedRequest.headers(),
                postData: interceptedRequest.postData(),
                timestamp: Date.now(),
              });
            }
            
            // Block resources if specified
            if (request.blockResources) {
              const resourceType = interceptedRequest.resourceType();
              if (request.blockResources.includes(resourceType)) {
                interceptedRequest.abort();
                return;
              }
            }
            
            interceptedRequest.continue();
          });
        }
        
        // Navigate and perform actions
        await engine.goto(request.url);
        
        if (request.actions) {
          for (const action of request.actions) {
            await this.performAction(engine, action);
          }
        }
        
        // Monitor for specified duration
        if (request.monitorDuration) {
          await engine.wait(request.monitorDuration);
        }
        
        return {
          interceptedRequests,
          interceptedResponses,
          totalRequests: interceptedRequests.length,
          totalResponses: interceptedResponses.length,
        };
      }, 3, 1000);
      
      const timeTaken = Date.now() - startTime;
      const dataSize = JSON.stringify(result).length;
      
      this.scraperLogger.logSuccess('NETWORK_INTERCEPT', request.url, timeTaken, dataSize);
      
      return result;
    } catch (error) {      const timeTaken = Date.now() - startTime;
      this.scraperLogger.logError('NETWORK_INTERCEPT', request.url, error as Error, timeTaken);
      throw handleScrapingError(error, request.url);
    } finally {
      if (engine) {
        await engine.close().catch(err => 
          this.scraperLogger.logWarning('NETWORK_INTERCEPT', 'Failed to close engine', { error: err.message })
        );
      }
    }
  }

  async advancedScrape(request: AdvancedScrapeRequestDto): Promise<any> {
    const startTime = Date.now();
    let engine;
    
    try {
      this.checkRateLimit(request.url);
      this.validationService.validateAdvancedScrapeRequest(request);
      
      this.scraperLogger.logRequest('ADVANCED_SCRAPE', request.url, request.engine || 'default', request.options);
      
      engine = await this.engineFactoryService.createEngine(
        request.engine,
        request.options,
      );
      
      const result = await retryOperation(async () => {
        await engine.goto(request.url);
        
        // Execute pre-actions if provided
        if (request.preActions && request.preActions.length > 0) {
          for (const action of request.preActions) {
            await this.performAction(engine, action);
          }
        }
        
        // Extract data based on rules
        const extractedData: any = {};
        if (request.extractionRules && request.extractionRules.length > 0) {
          for (const rule of request.extractionRules) {
            try {
              extractedData[rule.name] = await this.extractDataByRule(engine, rule);
            } catch (err) {
              this.scraperLogger.logWarning('ADVANCED_SCRAPE', `Failed to extract ${rule.name}`, { error: (err as Error).message });
              extractedData[rule.name] = rule.defaultValue || null;
            }
          }
        }
        
        return extractedData;
      }, 3, 1000);
      
      const timeTaken = Date.now() - startTime;
      const dataSize = JSON.stringify(result).length;
      
      this.scraperLogger.logSuccess('ADVANCED_SCRAPE', request.url, timeTaken, dataSize);
      
      return result;
    } catch (error) {      const timeTaken = Date.now() - startTime;
      this.scraperLogger.logError('ADVANCED_SCRAPE', request.url, error as Error, timeTaken);
      throw handleScrapingError(error, request.url);
    } finally {
      if (engine) {
        await engine.close().catch(err => 
          this.scraperLogger.logWarning('ADVANCED_SCRAPE', 'Failed to close engine', { error: err.message })
        );
      }
    }
  }

  async monitor(request: MonitoringRequestDto): Promise<any> {
    const startTime = Date.now();
    let engine;
    
    try {
      this.checkRateLimit(request.url);
      this.validationService.validateMonitoringRequest(request.selectors);
      
      this.scraperLogger.logRequest('MONITOR', request.url, request.engine || 'default', request.options);
      
      engine = await this.engineFactoryService.createEngine(
        request.engine,
        request.options,
      );
      
      const result = await retryOperation(async () => {
        await engine.goto(request.url);
        
        const duration = request.duration || 60000; // Default 1 minute
        const interval = request.interval || 5000; // Default 5 seconds
        const maxChanges = request.maxChanges || 10;
        
        const changes: any[] = [];
        const endTime = Date.now() + duration;
        
        // Get initial state
        const initialState: any = {};
        for (const selector of request.selectors) {
          try {
            const state: any = {
              text: await engine.getText(selector),
              visible: await engine.isVisible(selector),
              count: await engine.evaluate((sel: string) => document.querySelectorAll(sel).length, selector),
            };
            
            if (request.monitorAttributes) {
              state.attributes = {};
              for (const attr of request.monitorAttributes) {
                state.attributes[attr] = await engine.getAttribute(selector, attr);
              }
            }
            
            initialState[selector] = state;
          } catch (err) {
            this.scraperLogger.logWarning('MONITOR', `Failed to get initial state for ${selector}`, { error: (err as Error).message });
            initialState[selector] = null;
          }
        }
        
        // Monitor for changes
        while (Date.now() < endTime && changes.length < maxChanges) {
          await engine.wait(interval);
          
          for (const selector of request.selectors) {
            try {
              const currentState: any = {
                text: await engine.getText(selector),
                visible: await engine.isVisible(selector),
                count: await engine.evaluate((sel: string) => document.querySelectorAll(sel).length, selector),
              };
              
              if (request.monitorAttributes) {
                currentState.attributes = {};
                for (const attr of request.monitorAttributes) {
                  currentState.attributes[attr] = await engine.getAttribute(selector, attr);
                }
              }
              
              const previous = initialState[selector];
              if (previous) {
                const changeTypes = request.changeTypes || ['text', 'visibility'];
                
                for (const changeType of changeTypes) {
                  let hasChanged = false;
                  let changeData: any = {};
                  
                  switch (changeType) {
                    case 'text':
                      if (previous.text !== currentState.text) {
                        hasChanged = true;
                        changeData = {
                          type: 'text',
                          selector,
                          previous: previous.text,
                          current: currentState.text,
                        };
                      }
                      break;
                    case 'visibility':
                      if (previous.visible !== currentState.visible) {
                        hasChanged = true;
                        changeData = {
                          type: 'visibility',
                          selector,
                          previous: previous.visible,
                          current: currentState.visible,
                        };
                      }
                      break;
                    case 'count':
                      if (previous.count !== currentState.count) {
                        hasChanged = true;
                        changeData = {
                          type: 'count',
                          selector,
                          previous: previous.count,
                          current: currentState.count,
                        };
                      }
                      break;
                    case 'attribute':
                      if (request.monitorAttributes && previous.attributes && currentState.attributes) {
                        for (const attr of request.monitorAttributes) {
                          if (previous.attributes[attr] !== currentState.attributes[attr]) {
                            hasChanged = true;
                            changeData = {
                              type: 'attribute',
                              selector,
                              attribute: attr,
                              previous: previous.attributes[attr],
                              current: currentState.attributes[attr],
                            };
                            break;
                          }
                        }
                      }
                      break;
                  }
                  
                  if (hasChanged) {
                    const change = {
                      ...changeData,
                      timestamp: Date.now(),
                    };
                    
                    changes.push(change);
                    
                    // Execute change actions if specified
                    if (request.onChangeActions) {
                      for (const action of request.onChangeActions) {
                        await this.performAction(engine, action);
                      }
                    }
                    
                    // Capture screenshot if requested
                    if (request.captureScreenshots) {
                      const screenshotPath = `change-${changes.length}-${Date.now()}.png`;
                      await engine.screenshot({ path: screenshotPath });
                      change.screenshot = screenshotPath;
                    }
                  }
                }
                
                // Update initial state with current state
                initialState[selector] = currentState;
              }
            } catch (err) {
              this.scraperLogger.logWarning('MONITOR', `Error monitoring ${selector}`, { error: (err as Error).message });
            }
          }
        }
        
        return {
          changes,
          totalChanges: changes.length,
          monitorDuration: Date.now() - startTime,
          selectors: request.selectors,
          finalState: initialState,
        };
      }, 3, 1000);
      
      const timeTaken = Date.now() - startTime;
      const dataSize = JSON.stringify(result).length;
      
      this.scraperLogger.logSuccess('MONITOR', request.url, timeTaken, dataSize);
      
      return result;
    } catch (error) {      const timeTaken = Date.now() - startTime;
      this.scraperLogger.logError('MONITOR', request.url, error as Error, timeTaken);
      throw handleScrapingError(error, request.url);
    } finally {
      if (engine) {
        await engine.close().catch(err => 
          this.scraperLogger.logWarning('MONITOR', 'Failed to close engine', { error: err.message })
        );
      }
    }
  }

  monitorStream(url: string, selectors: string[], checkInterval = 5000): Observable<any> {
    const subject = new Subject<any>();
    
    (async () => {
      let engine;
      try {
        engine = await this.engineFactoryService.createEngine();
        await engine.goto(url);
        
        // Initial state
        const initialState: any = {};
        for (const selector of selectors) {
          try {
            initialState[selector] = await engine.getText(selector);
          } catch (err) {
            initialState[selector] = null;
          }
        }
        
        const intervalSub = interval(checkInterval).subscribe(async () => {
          try {
            for (const selector of selectors) {
              try {
                const currentText = await engine.getText(selector);
                if (currentText !== initialState[selector]) {
                  subject.next({
                    type: 'change',
                    data: {
                      selector,
                      previous: initialState[selector],
                      current: currentText,
                      timestamp: Date.now(),
                    },
                  });
                  
                  initialState[selector] = currentText;
                }
              } catch (err) {
                subject.next({
                  type: 'error',
                  data: {
                    selector,
                    error: (err as Error).message,
                    timestamp: Date.now(),
                  },
                });
              }
            }
          } catch (err) {
            subject.error(err);
          }
        });
        
        // Cleanup after 10 minutes
        setTimeout(() => {
          intervalSub.unsubscribe();
          if (engine) {
            engine.close();
          }
          subject.complete();
        }, 600000);
        
      } catch (error) {
        subject.error(error);
      }
    })();
    
    return subject.asObservable();
  }

  async getAvailableDevices() {
    try {
      const playwrightDevices = Object.keys(devices).map(name => ({
        name,
        ...devices[name],
      }));
      
      return {
        devices: playwrightDevices,
        total: playwrightDevices.length,
      };
    } catch (error) {
      this.scraperLogger.logError('GET_DEVICES', 'devices', error as Error);
      throw error;
    }
  }

  async batchScrape(request: any): Promise<any> {
    const { urls, extractionRules, concurrent = 3, delay = 1000, engine, options } = request;
    const results: any[] = [];
    const startTime = Date.now();
    
    try {
      this.validationService.validateBatchRequest(request);
      
      this.scraperLogger.logBatchOperation('BATCH_SCRAPE', urls.length, 0, 0, 0);
      
      // Process URLs in batches
      for (let i = 0; i < urls.length; i += concurrent) {
        const batch = urls.slice(i, i + concurrent);
        
        const batchResults = await Promise.allSettled(
          batch.map(async (url: string) => {
            let scrapeEngine;
            try {
              this.checkRateLimit(url);
              
              scrapeEngine = await this.engineFactoryService.createEngine(engine, options);
              await scrapeEngine.goto(url);
              
              const extractedData: any = { url };
              
              if (extractionRules && extractionRules.length > 0) {
                for (const rule of extractionRules) {
                  try {
                    extractedData[rule.name] = await this.extractDataByRule(scrapeEngine, rule);
                  } catch (err) {
                    extractedData[rule.name] = rule.defaultValue || null;
                  }
                }
              }
              
              return { success: true, data: extractedData, url };
            } catch (error) {
              return { success: false, error: (error as Error).message, url };
            } finally {
              if (scrapeEngine) {
                await scrapeEngine.close().catch(() => {});
              }
            }
          })
        );
        
        results.push(...batchResults.map(result => 
          result.status === 'fulfilled' ? result.value : { 
            success: false, 
            error: result.reason?.message || 'Unknown error',
            url: batch[batchResults.indexOf(result)]
          }
        ));
        
        // Add delay between batches
        if (i + concurrent < urls.length && delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      const timeTaken = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;
      
      this.scraperLogger.logBatchOperation('BATCH_SCRAPE', results.length, successful, failed, timeTaken);
      
      return {
        results,
        summary: {
          total: results.length,
          successful,
          failed,
          timeTaken,
        },
      };
    } catch (error) {
      const timeTaken = Date.now() - startTime;
      this.scraperLogger.logError('BATCH_SCRAPE', 'batch', error as Error, timeTaken);
      throw error;
    }
  }

  private async performAction(engine: any, action: any): Promise<void> {
    switch (action.type) {
      case 'click':
        if (action.selector) {
          await engine.click(action.selector);
        }
        break;
      case 'scroll':
        if (action.selector) {
          await engine.scroll({ selector: action.selector });
        } else {
          await engine.scroll();
        }
        break;
      case 'wait':
        if (action.duration) {
          await engine.wait(action.duration);
        }
        break;
      case 'type':
        if (action.selector && action.value) {
          await engine.type(action.selector, action.value);
        }
        break;
      case 'navigate':
        if (action.url) {
          await engine.goto(action.url);
        }
        break;
      default:
        this.scraperLogger.logWarning('PERFORM_ACTION', `Unknown action type: ${action.type}`);
    }
  }

  private async extractDataByRule(engine: any, rule: DataExtractionRule): Promise<any> {
    try {
      let data: any;
      
      switch (rule.extractType) {
        case 'text':
          data = rule.multiple 
            ? await engine.getAllText(rule.selector)
            : await engine.getText(rule.selector);
          break;
        case 'html':
          data = await engine.evaluate((selector: string, multiple: boolean) => {
            if (multiple) {
              return Array.from(document.querySelectorAll(selector)).map(el => el.innerHTML);
            } else {
              const element = document.querySelector(selector);
              return element ? element.innerHTML : null;
            }
          }, rule.selector, rule.multiple || false);
          break;
        case 'attribute':
          if (rule.attributeName) {
            data = rule.multiple
              ? await engine.getAllAttribute(rule.selector, rule.attributeName)
              : await engine.getAttribute(rule.selector, rule.attributeName);
          }
          break;
        case 'count':
          data = await engine.evaluate((selector: string) => {
            return document.querySelectorAll(selector).length;
          }, rule.selector);
          break;
        default:
          data = await engine.getText(rule.selector);
      }
      
      // Apply transformations if specified
      if (data && rule.transform) {
        data = this.applyTransform(data, rule.transform);
      }
      
      // Apply regex if specified
      if (data && rule.regex) {
        const regex = new RegExp(rule.regex, rule.regexFlags || '');
        if (Array.isArray(data)) {
          data = data.map(item => {
            const match = String(item).match(regex);
            return match ? match[0] : item;
          });
        } else {
          const match = String(data).match(regex);
          data = match ? match[0] : data;
        }
      }
      
      // Handle multiple vs single results
      if (!rule.multiple && Array.isArray(data)) {
        data = data[0] || rule.defaultValue;
      }
      
      return data;
    } catch (error) {
      console.warn(`Failed to extract data for rule ${rule.name}:`, (error as Error).message);
      return rule.defaultValue || null;
    }
  }

  private applyTransform(data: any, transform: string): any {
    if (Array.isArray(data)) {
      return data.map(item => this.applyTransformSingle(item, transform));
    }
    return this.applyTransformSingle(data, transform);
  }

  private applyTransformSingle(value: any, transform: string): any {
    if (value == null) return value;
    
    const str = String(value);
    
    switch (transform) {
      case 'trim':
        return str.trim();
      case 'uppercase':
        return str.toUpperCase();
      case 'lowercase':
        return str.toLowerCase();
      case 'number':
        const num = parseFloat(str.replace(/[^\d.-]/g, ''));
        return isNaN(num) ? value : num;
      case 'boolean':
        return ['true', '1', 'yes', 'on'].includes(str.toLowerCase());
      case 'clean':
        return str.replace(/\s+/g, ' ').trim();
      default:
        return value;
    }
  }
}
