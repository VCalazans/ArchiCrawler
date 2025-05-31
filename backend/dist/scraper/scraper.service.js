"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const engine_factory_service_1 = require("../core/services/engine-factory.service");
const playwright_1 = require("playwright");
const validation_service_1 = require("../core/utils/validation.service");
const scraper_logger_1 = require("../core/utils/scraper-logger");
const error_handling_1 = require("../core/utils/error-handling");
let ScraperService = class ScraperService {
    constructor(engineFactoryService, validationService, scraperLogger) {
        this.engineFactoryService = engineFactoryService;
        this.validationService = validationService;
        this.scraperLogger = scraperLogger;
        this.requestCounts = new Map();
        this.rateLimitWindow = 60000;
        this.rateLimitMax = 100;
    }
    checkRateLimit(identifier) {
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
            throw new error_handling_1.RateLimitError(`Rate limit exceeded: ${this.rateLimitMax} requests per minute`);
        }
        userLimits.count++;
    }
    async getAvailableEngines() {
        return {
            availableEngines: this.engineFactoryService.getAvailableEngines(),
            defaultEngine: this.engineFactoryService.getDefaultEngine(),
        };
    }
    async extract(request) {
        const startTime = Date.now();
        let engine;
        try {
            this.checkRateLimit(request.url);
            this.validationService.validateUrl(request.url);
            if (request.selector) {
                this.validationService.validateSelector(request.selector);
            }
            this.scraperLogger.logRequest('EXTRACT', request.url, request.engine || 'default', request.options);
            engine = await this.engineFactoryService.createEngine(request.engine, request.options);
            const result = await (0, error_handling_1.retryOperation)(async () => {
                await engine.navigate(request.url);
                if (request.waitForSelector) {
                    try {
                        await engine.waitForSelector(request.waitForSelector, { timeout: 5000 });
                    }
                    catch (selectorError) {
                        this.scraperLogger.logWarning('EXTRACT', `Selector '${request.waitForSelector}' not found, continuing anyway`, {
                            url: request.url,
                            selector: request.waitForSelector
                        });
                    }
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
        }
        catch (error) {
            const timeTaken = Date.now() - startTime;
            this.scraperLogger.logError('EXTRACT', request.url, error, timeTaken);
            throw (0, error_handling_1.handleScrapingError)(error, request.url, request.selector);
        }
        finally {
            if (engine) {
                await engine.close().catch(err => this.scraperLogger.logWarning('EXTRACT', 'Failed to close engine', { error: err.message }));
            }
        }
    }
    async screenshot(request) {
        const startTime = Date.now();
        let engine;
        try {
            this.checkRateLimit(request.url);
            this.validationService.validateUrl(request.url);
            this.scraperLogger.logRequest('SCREENSHOT', request.url, request.engine || 'default', request.options);
            engine = await this.engineFactoryService.createEngine(request.engine, request.options);
            const result = await (0, error_handling_1.retryOperation)(async () => {
                await engine.navigate(request.url);
                if (request.screenshotOptions?.waitForSelector) {
                    try {
                        await engine.waitForSelector(request.screenshotOptions.waitForSelector, { timeout: 5000 });
                    }
                    catch (selectorError) {
                        this.scraperLogger.logWarning('SCREENSHOT', `Selector '${request.screenshotOptions.waitForSelector}' not found, continuing anyway`, {
                            url: request.url,
                            selector: request.screenshotOptions.waitForSelector
                        });
                    }
                }
                const options = {
                    type: 'png',
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
        }
        catch (error) {
            const timeTaken = Date.now() - startTime;
            this.scraperLogger.logError('SCREENSHOT', request.url, error, timeTaken);
            throw (0, error_handling_1.handleScrapingError)(error, request.url);
        }
        finally {
            if (engine) {
                await engine.close().catch(err => this.scraperLogger.logWarning('SCREENSHOT', 'Failed to close engine', { error: err.message }));
            }
        }
    }
    async pdf(request) {
        const startTime = Date.now();
        let engine;
        try {
            this.checkRateLimit(request.url);
            this.validationService.validateUrl(request.url);
            this.scraperLogger.logRequest('PDF', request.url, request.engine || 'default', request.options);
            engine = await this.engineFactoryService.createEngine(request.engine, request.options);
            const result = await (0, error_handling_1.retryOperation)(async () => {
                await engine.navigate(request.url);
                if (request.pdfOptions?.waitForSelector) {
                    try {
                        await engine.waitForSelector(request.pdfOptions.waitForSelector, { timeout: 5000 });
                    }
                    catch (selectorError) {
                        this.scraperLogger.logWarning('PDF', `Selector '${request.pdfOptions.waitForSelector}' not found, continuing anyway`, {
                            url: request.url,
                            selector: request.pdfOptions.waitForSelector
                        });
                    }
                }
                const options = {
                    format: 'A4',
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
        }
        catch (error) {
            const timeTaken = Date.now() - startTime;
            this.scraperLogger.logError('PDF', request.url, error, timeTaken);
            throw (0, error_handling_1.handleScrapingError)(error, request.url);
        }
        finally {
            if (engine) {
                await engine.close().catch(err => this.scraperLogger.logWarning('PDF', 'Failed to close engine', { error: err.message }));
            }
        }
    }
    async evaluate(request) {
        const startTime = Date.now();
        let engine;
        try {
            this.checkRateLimit(request.url);
            this.validationService.validateUrl(request.url);
            this.scraperLogger.logRequest('EVALUATE', request.url, request.engine || 'default', request.options);
            engine = await this.engineFactoryService.createEngine(request.engine, request.options);
            const result = await (0, error_handling_1.retryOperation)(async () => {
                await engine.navigate(request.url);
                if (request.options?.waitForSelector) {
                    try {
                        await engine.waitForSelector(request.options.waitForSelector, { timeout: 5000 });
                    }
                    catch (selectorError) {
                        this.scraperLogger.logWarning('EVALUATE', `Selector '${request.options.waitForSelector}' not found, continuing anyway`, {
                            url: request.url,
                            selector: request.options.waitForSelector
                        });
                    }
                }
                return await engine.evaluate(request.script);
            }, 3, 1000);
            const timeTaken = Date.now() - startTime;
            const dataSize = JSON.stringify(result).length;
            this.scraperLogger.logSuccess('EVALUATE', request.url, timeTaken, dataSize);
            return result;
        }
        catch (error) {
            const timeTaken = Date.now() - startTime;
            this.scraperLogger.logError('EVALUATE', request.url, error, timeTaken);
            throw (0, error_handling_1.handleScrapingError)(error, request.url);
        }
        finally {
            if (engine) {
                await engine.close().catch(err => this.scraperLogger.logWarning('EVALUATE', 'Failed to close engine', { error: err.message }));
            }
        }
    }
    async interactWithForm(request) {
        const startTime = Date.now();
        let engine;
        try {
            this.checkRateLimit(request.url);
            this.validationService.validateFormInteraction(request);
            this.scraperLogger.logRequest('FORM_INTERACTION', request.url, request.engine || 'default', request.options);
            engine = await this.engineFactoryService.createEngine(request.engine, request.options);
            const result = await (0, error_handling_1.retryOperation)(async () => {
                await engine.navigate(request.url);
                for (const field of request.fields) {
                    await engine.waitForSelector(field.selector);
                    switch (field.action) {
                        case 'fill':
                            await engine.clear(field.selector);
                            await engine.type(field.selector, field.value);
                            break;
                        case 'click':
                            await engine.click(field.selector);
                            break;
                        case 'select':
                            await engine.selectOption(field.selector, field.value);
                            break;
                        case 'check':
                            await engine.setChecked(field.selector, true);
                            break;
                        case 'uncheck':
                            await engine.setChecked(field.selector, false);
                            break;
                        case 'upload':
                            if (field.value && Array.isArray(field.value)) {
                                await engine.uploadFiles(field.selector, field.value);
                            }
                            break;
                    }
                    if (field.waitAfter) {
                        await engine.wait(field.waitAfter);
                    }
                }
                if (request.submitSelector) {
                    await engine.click(request.submitSelector);
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
        }
        catch (error) {
            const timeTaken = Date.now() - startTime;
            this.scraperLogger.logError('FORM_INTERACTION', request.url, error, timeTaken);
            throw (0, error_handling_1.handleScrapingError)(error, request.url);
        }
        finally {
            if (engine) {
                await engine.close().catch(err => this.scraperLogger.logWarning('FORM_INTERACTION', 'Failed to close engine', { error: err.message }));
            }
        }
    }
    async interceptNetwork(request) {
        const startTime = Date.now();
        let engine;
        try {
            this.checkRateLimit(request.url);
            this.validationService.validateUrl(request.url);
            this.scraperLogger.logRequest('NETWORK_INTERCEPT', request.url, request.engine || 'default', request.options);
            engine = await this.engineFactoryService.createEngine(request.engine, request.options);
            const result = await (0, error_handling_1.retryOperation)(async () => {
                const interceptedRequests = [];
                const interceptedResponses = [];
                if (request.interceptPatterns && request.interceptPatterns.length > 0) {
                    await engine.interceptRequests(async (interceptedRequest) => {
                        const url = interceptedRequest.url();
                        const shouldIntercept = request.interceptPatterns.some(pattern => url.includes(pattern) || new RegExp(pattern.replace(/\*/g, '.*')).test(url));
                        if (shouldIntercept && request.captureData) {
                            interceptedRequests.push({
                                url: url,
                                method: interceptedRequest.method(),
                                headers: interceptedRequest.headers(),
                                postData: interceptedRequest.postData(),
                                timestamp: Date.now(),
                            });
                        }
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
                await engine.navigate(request.url);
                if (request.actions) {
                    for (const action of request.actions) {
                        await this.performAction(engine, action);
                    }
                }
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
        }
        catch (error) {
            const timeTaken = Date.now() - startTime;
            this.scraperLogger.logError('NETWORK_INTERCEPT', request.url, error, timeTaken);
            throw (0, error_handling_1.handleScrapingError)(error, request.url);
        }
        finally {
            if (engine) {
                await engine.close().catch(err => this.scraperLogger.logWarning('NETWORK_INTERCEPT', 'Failed to close engine', { error: err.message }));
            }
        }
    }
    async advancedScrape(request) {
        const startTime = Date.now();
        let engine;
        try {
            this.checkRateLimit(request.url);
            this.validationService.validateAdvancedScrapeRequest(request);
            this.scraperLogger.logRequest('ADVANCED_SCRAPE', request.url, request.engine || 'default', request.options);
            engine = await this.engineFactoryService.createEngine(request.engine, request.options);
            const result = await (0, error_handling_1.retryOperation)(async () => {
                await engine.navigate(request.url);
                if (request.preActions && request.preActions.length > 0) {
                    for (const action of request.preActions) {
                        await this.performAction(engine, action);
                    }
                }
                const extractedData = {};
                if (request.extractionRules && request.extractionRules.length > 0) {
                    for (const rule of request.extractionRules) {
                        try {
                            extractedData[rule.name] = await this.extractDataByRule(engine, rule);
                        }
                        catch (err) {
                            this.scraperLogger.logWarning('ADVANCED_SCRAPE', `Failed to extract ${rule.name}`, { error: err.message });
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
        }
        catch (error) {
            const timeTaken = Date.now() - startTime;
            this.scraperLogger.logError('ADVANCED_SCRAPE', request.url, error, timeTaken);
            throw (0, error_handling_1.handleScrapingError)(error, request.url);
        }
        finally {
            if (engine) {
                await engine.close().catch(err => this.scraperLogger.logWarning('ADVANCED_SCRAPE', 'Failed to close engine', { error: err.message }));
            }
        }
    }
    async monitor(request) {
        const startTime = Date.now();
        let engine;
        try {
            this.checkRateLimit(request.url);
            this.validationService.validateMonitoringRequest(request.selectors);
            this.scraperLogger.logRequest('MONITOR', request.url, request.engine || 'default', request.options);
            engine = await this.engineFactoryService.createEngine(request.engine, request.options);
            const result = await (0, error_handling_1.retryOperation)(async () => {
                await engine.navigate(request.url);
                const duration = request.duration || 60000;
                const interval = request.interval || 5000;
                const maxChanges = request.maxChanges || 10;
                const changes = [];
                const endTime = Date.now() + duration;
                const initialState = {};
                for (const selector of request.selectors) {
                    try {
                        const state = {
                            text: await engine.getText(selector),
                            visible: await engine.isVisible(selector),
                            count: await engine.evaluate((sel) => document.querySelectorAll(sel).length, selector),
                        };
                        if (request.monitorAttributes) {
                            state.attributes = {};
                            for (const attr of request.monitorAttributes) {
                                state.attributes[attr] = await engine.getAttribute(selector, attr);
                            }
                        }
                        initialState[selector] = state;
                    }
                    catch (err) {
                        this.scraperLogger.logWarning('MONITOR', `Failed to get initial state for ${selector}`, { error: err.message });
                        initialState[selector] = null;
                    }
                }
                while (Date.now() < endTime && changes.length < maxChanges) {
                    await engine.wait(interval);
                    for (const selector of request.selectors) {
                        try {
                            const currentState = {
                                text: await engine.getText(selector),
                                visible: await engine.isVisible(selector),
                                count: await engine.evaluate((sel) => document.querySelectorAll(sel).length, selector),
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
                                    let changeData = {};
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
                                        if (request.onChangeActions) {
                                            for (const action of request.onChangeActions) {
                                                await this.performAction(engine, action);
                                            }
                                        }
                                        if (request.captureScreenshots) {
                                            const screenshotPath = `change-${changes.length}-${Date.now()}.png`;
                                            await engine.screenshot({ path: screenshotPath });
                                            change.screenshot = screenshotPath;
                                        }
                                    }
                                }
                                initialState[selector] = currentState;
                            }
                        }
                        catch (err) {
                            this.scraperLogger.logWarning('MONITOR', `Error monitoring ${selector}`, { error: err.message });
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
        }
        catch (error) {
            const timeTaken = Date.now() - startTime;
            this.scraperLogger.logError('MONITOR', request.url, error, timeTaken);
            throw (0, error_handling_1.handleScrapingError)(error, request.url);
        }
        finally {
            if (engine) {
                await engine.close().catch(err => this.scraperLogger.logWarning('MONITOR', 'Failed to close engine', { error: err.message }));
            }
        }
    }
    monitorStream(url, selectors, checkInterval = 5000) {
        const subject = new rxjs_1.Subject();
        (async () => {
            let engine;
            try {
                engine = await this.engineFactoryService.createEngine();
                await engine.navigate(url);
                const initialState = {};
                for (const selector of selectors) {
                    try {
                        initialState[selector] = await engine.getText(selector);
                    }
                    catch (err) {
                        initialState[selector] = null;
                    }
                }
                const intervalSub = (0, rxjs_1.interval)(checkInterval).subscribe(async () => {
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
                            }
                            catch (err) {
                                subject.next({
                                    type: 'error',
                                    data: {
                                        selector,
                                        error: err.message,
                                        timestamp: Date.now(),
                                    },
                                });
                            }
                        }
                    }
                    catch (err) {
                        subject.error(err);
                    }
                });
                setTimeout(() => {
                    intervalSub.unsubscribe();
                    if (engine) {
                        engine.close();
                    }
                    subject.complete();
                }, 600000);
            }
            catch (error) {
                subject.error(error);
            }
        })();
        return subject.asObservable();
    }
    async getAvailableDevices() {
        try {
            const playwrightDevices = Object.keys(playwright_1.devices).map(name => ({
                name,
                ...playwright_1.devices[name],
            }));
            return {
                devices: playwrightDevices,
                total: playwrightDevices.length,
            };
        }
        catch (error) {
            this.scraperLogger.logError('GET_DEVICES', 'devices', error);
            throw error;
        }
    }
    async batchScrape(request) {
        const startTime = Date.now();
        const results = [];
        try {
            this.scraperLogger.logRequest('BATCH_SCRAPE', 'multiple', request.engine || 'default', request.options);
            for (const url of request.urls) {
                try {
                    const scrapeRequest = {
                        ...request,
                        url,
                    };
                    const result = await this.extract(scrapeRequest);
                    results.push({
                        url,
                        status: 'success',
                        data: result.data,
                    });
                }
                catch (error) {
                    results.push({
                        url,
                        status: 'error',
                        error: error.message,
                    });
                }
            }
            const timeTaken = Date.now() - startTime;
            const successCount = results.filter(r => r.status === 'success').length;
            this.scraperLogger.logSuccess('BATCH_SCRAPE', 'multiple', timeTaken, results.length);
            return {
                status: 'completed',
                results,
                summary: {
                    total: request.urls.length,
                    successful: successCount,
                    failed: request.urls.length - successCount,
                },
                timeTaken,
            };
        }
        catch (error) {
            const timeTaken = Date.now() - startTime;
            this.scraperLogger.logError('BATCH_SCRAPE', 'multiple', error, timeTaken);
            throw (0, error_handling_1.handleScrapingError)(error, 'batch operation');
        }
    }
    async performAction(engine, action) {
        switch (action.type) {
            case 'click':
                if (action.selector) {
                    await engine.click(action.selector);
                }
                break;
            case 'scroll':
                if (action.selector) {
                    await engine.scroll({ selector: action.selector });
                }
                else {
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
                    await engine.navigate(action.url);
                }
                break;
            default:
                this.scraperLogger.logWarning('PERFORM_ACTION', `Unknown action type: ${action.type}`);
        }
    }
    async extractDataByRule(engine, rule) {
        try {
            let data;
            switch (rule.extractType) {
                case 'text':
                    data = rule.multiple
                        ? await engine.getText(rule.selector)
                        : await engine.getText(rule.selector);
                    break;
                case 'html':
                    data = await engine.evaluate((selector, multiple) => {
                        if (multiple) {
                            return Array.from(document.querySelectorAll(selector)).map(el => el.innerHTML);
                        }
                        else {
                            const element = document.querySelector(selector);
                            return element ? element.innerHTML : null;
                        }
                    }, rule.selector, rule.multiple || false);
                    break;
                case 'attribute':
                    if (rule.attributeName) {
                        data = rule.multiple
                            ? await engine.getAttribute(rule.selector, rule.attributeName)
                            : await engine.getAttribute(rule.selector, rule.attributeName);
                    }
                    break;
                case 'count':
                    data = await engine.evaluate((selector) => {
                        return document.querySelectorAll(selector).length;
                    }, rule.selector);
                    break;
                default:
                    data = await engine.getText(rule.selector);
            }
            if (data && rule.transform) {
                data = this.applyTransform(data, rule.transform);
            }
            if (data && rule.regex) {
                const regex = new RegExp(rule.regex, rule.regexFlags || '');
                if (Array.isArray(data)) {
                    data = data.map(item => {
                        const match = String(item).match(regex);
                        return match ? match[0] : item;
                    });
                }
                else {
                    const match = String(data).match(regex);
                    data = match ? match[0] : data;
                }
            }
            if (!rule.multiple && Array.isArray(data)) {
                data = data[0] || rule.defaultValue;
            }
            return data;
        }
        catch (error) {
            console.warn(`Failed to extract data for rule ${rule.name}:`, error.message);
            return rule.defaultValue || null;
        }
    }
    applyTransform(data, transform) {
        if (Array.isArray(data)) {
            return data.map(item => this.applyTransformSingle(item, transform));
        }
        return this.applyTransformSingle(data, transform);
    }
    applyTransformSingle(value, transform) {
        if (value == null)
            return value;
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
    async advancedExtract(request) {
        return this.advancedScrape(request);
    }
    async formInteraction(request) {
        return this.interactWithForm(request);
    }
    async networkIntercept(request) {
        return this.interceptNetwork(request);
    }
};
exports.ScraperService = ScraperService;
exports.ScraperService = ScraperService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [engine_factory_service_1.EngineFactoryService,
        validation_service_1.ValidationService,
        scraper_logger_1.ScraperLogger])
], ScraperService);
//# sourceMappingURL=scraper.service.js.map