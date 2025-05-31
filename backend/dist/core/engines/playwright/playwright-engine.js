"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaywrightEngine = void 0;
const playwright_1 = require("playwright");
class PlaywrightEngine {
    constructor(options) {
        this.networkRequests = [];
        this.options = {
            headless: true,
            timeout: 30000,
            width: 1280,
            height: 720,
            ignoreHTTPSErrors: false,
            javaScriptEnabled: true,
            acceptDownloads: false,
            bypassCSP: false,
            ...options,
        };
    }
    async initialize() {
        const browserType = this.options.browserType || 'chromium';
        const launchOptions = {
            headless: this.options.headless,
            devtools: this.options.devtools,
            slowMo: this.options.slowMo,
            timeout: this.options.timeout,
        };
        if (this.options.executablePath) {
            launchOptions.executablePath = this.options.executablePath;
        }
        if (this.options.args) {
            launchOptions.args = this.options.args;
        }
        if (this.options.proxy) {
            launchOptions.proxy = this.options.proxy;
        }
        switch (browserType) {
            case 'firefox':
                this.browser = await playwright_1.firefox.launch(launchOptions);
                break;
            case 'webkit':
                this.browser = await playwright_1.webkit.launch(launchOptions);
                break;
            default:
                this.browser = await playwright_1.chromium.launch(launchOptions);
        }
        const contextOptions = {
            ignoreHTTPSErrors: this.options.ignoreHTTPSErrors,
            javaScriptEnabled: this.options.javaScriptEnabled,
            acceptDownloads: this.options.acceptDownloads,
            bypassCSP: this.options.bypassCSP,
        };
        if (this.options.device) {
            const device = playwright_1.devices[this.options.device];
            if (device) {
                contextOptions.viewport = device.viewport;
                contextOptions.userAgent = device.userAgent;
                contextOptions.deviceScaleFactor = device.deviceScaleFactor;
                contextOptions.isMobile = device.isMobile;
                contextOptions.hasTouch = device.hasTouch;
            }
        }
        else {
            contextOptions.viewport = {
                width: this.options.width,
                height: this.options.height,
            };
        }
        if (this.options.userAgent) {
            contextOptions.userAgent = this.options.userAgent;
        }
        if (this.options.locale) {
            contextOptions.locale = this.options.locale;
        }
        if (this.options.timezoneId) {
            contextOptions.timezoneId = this.options.timezoneId;
        }
        if (this.options.geolocation) {
            contextOptions.geolocation = this.options.geolocation;
        }
        if (this.options.permissions) {
            contextOptions.permissions = this.options.permissions;
        }
        if (this.options.colorScheme) {
            contextOptions.colorScheme = this.options.colorScheme;
        }
        if (this.options.reducedMotion) {
            contextOptions.reducedMotion = this.options.reducedMotion;
        }
        if (this.options.extraHTTPHeaders) {
            contextOptions.extraHTTPHeaders = this.options.extraHTTPHeaders;
        }
        if (this.options.httpCredentials) {
            contextOptions.httpCredentials = this.options.httpCredentials;
        }
        if (this.options.offline) {
            contextOptions.offline = this.options.offline;
        }
        if (this.options.recordHar) {
            contextOptions.recordHar = this.options.recordHar;
        }
        if (this.options.recordVideo) {
            contextOptions.recordVideo = this.options.recordVideo;
        }
        this.context = await this.browser.newContext(contextOptions);
        if (this.options.blockResources && this.options.blockResources.length > 0) {
            await this.context.route('**/*', (route) => {
                const resourceType = route.request().resourceType();
                if (this.options.blockResources.includes(resourceType)) {
                    route.abort();
                }
                else {
                    route.continue();
                }
            });
        }
        this.page = await this.context.newPage();
        this.page.setDefaultTimeout(this.options.timeout);
        this.page.on('request', (request) => {
            this.networkRequests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                timestamp: new Date().toISOString(),
            });
        });
    }
    async navigate(url) {
        await this.page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: this.options.timeout,
        });
    }
    async wait(milliseconds) {
        await this.page.waitForTimeout(milliseconds);
    }
    async waitForSelector(selector, options) {
        await this.page.waitForSelector(selector, options);
    }
    async waitForLoadState(state = 'load') {
        await this.page.waitForLoadState(state);
    }
    async getText(selector) {
        return this.page.$$eval(selector, (elements) => elements.map((el) => el.textContent?.trim() || ''));
    }
    async getAttribute(selector, attributeName) {
        return this.page.$$eval(selector, (elements, attr) => elements.map((el) => el.getAttribute(attr) || ''), attributeName);
    }
    async getProperty(selector, propertyName) {
        return this.page.$$eval(selector, (elements, prop) => elements.map((el) => el[prop]), propertyName);
    }
    async getElementData(selector, options) {
        return this.page.$$eval(selector, (elements) => {
            return elements.map((el) => {
                const data = {
                    text: el.textContent?.trim() || '',
                    innerHTML: el.innerHTML,
                    outerHTML: el.outerHTML,
                    tagName: el.tagName.toLowerCase(),
                };
                data.attributes = {};
                for (let i = 0; i < el.attributes.length; i++) {
                    const attr = el.attributes[i];
                    data.attributes[attr.name] = attr.value;
                }
                if (options?.includeStyles) {
                    const computedStyle = window.getComputedStyle(el);
                    data.styles = {};
                    for (let i = 0; i < computedStyle.length; i++) {
                        const prop = computedStyle[i];
                        data.styles[prop] = computedStyle.getPropertyValue(prop);
                    }
                }
                const rect = el.getBoundingClientRect();
                data.boundingBox = {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                };
                return data;
            });
        });
    }
    async elementExists(selector) {
        const element = await this.page.$(selector);
        return element !== null;
    }
    async isVisible(selector) {
        const element = await this.page.$(selector);
        if (!element)
            return false;
        return await element.isVisible();
    }
    async screenshot(options) {
        return this.page.screenshot(options);
    }
    async pdf(options) {
        return this.page.pdf(options);
    }
    async evaluate(script) {
        return this.page.evaluate(script);
    }
    async click(selector, options) {
        await this.page.click(selector, options);
    }
    async doubleClick(selector, options) {
        await this.page.dblclick(selector, options);
    }
    async rightClick(selector, options) {
        await this.page.click(selector, { ...options, button: 'right' });
    }
    async hover(selector) {
        await this.page.hover(selector);
    }
    async type(selector, text, options) {
        await this.page.type(selector, text, options);
    }
    async fill(selector, value) {
        await this.page.fill(selector, value);
    }
    async clear(selector) {
        await this.page.fill(selector, '');
    }
    async selectOption(selector, value) {
        await this.page.selectOption(selector, value);
    }
    async setChecked(selector, checked) {
        await this.page.setChecked(selector, checked);
    }
    async uploadFiles(selector, files) {
        await this.page.setInputFiles(selector, files);
    }
    async press(key) {
        await this.page.keyboard.press(key);
    }
    async scroll(options) {
        if (options?.selector) {
            await this.page.locator(options.selector).scrollIntoViewIfNeeded();
        }
        else {
            await this.page.evaluate((scrollOptions) => {
                window.scrollTo(scrollOptions);
            }, options || { top: 0, left: 0 });
        }
    }
    async getCurrentUrl() {
        return this.page.url();
    }
    async getTitle() {
        return this.page.title();
    }
    async goBack() {
        await this.page.goBack();
    }
    async goForward() {
        await this.page.goForward();
    }
    async reload() {
        await this.page.reload();
    }
    async setViewport(width, height) {
        await this.page.setViewportSize({ width, height });
    }
    async addCookies(cookies) {
        await this.context.addCookies(cookies);
    }
    async getCookies() {
        return this.context.cookies();
    }
    async clearCookies() {
        await this.context.clearCookies();
    }
    async setGeolocation(latitude, longitude) {
        await this.context.setGeolocation({ latitude, longitude });
    }
    async blockResources(resourceTypes) {
        await this.context.route('**/*', (route) => {
            const resourceType = route.request().resourceType();
            if (resourceTypes.includes(resourceType)) {
                route.abort();
            }
            else {
                route.continue();
            }
        });
    }
    async interceptRequests(callback) {
        await this.context.route('**/*', async (route) => {
            await callback(route.request());
            route.continue();
        });
    }
    async getNetworkRequests() {
        return this.networkRequests;
    }
    async emulateDevice(device) {
        let deviceConfig;
        if (typeof device === 'string') {
            deviceConfig = playwright_1.devices[device];
        }
        else {
            deviceConfig = device;
        }
        if (deviceConfig) {
            await this.page.setViewportSize(deviceConfig.viewport);
            const newContext = await this.browser.newContext({
                ...deviceConfig,
                userAgent: deviceConfig.userAgent
            });
            this.context = newContext;
            this.page = await this.context.newPage();
        }
    }
    async setUserAgent(userAgent) {
        const newContext = await this.browser.newContext({
            userAgent: userAgent
        });
        this.context = newContext;
        this.page = await this.context.newPage();
    }
    async close() {
        if (this.context) {
            await this.context.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
    }
}
exports.PlaywrightEngine = PlaywrightEngine;
//# sourceMappingURL=playwright-engine.js.map