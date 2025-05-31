"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppeteerEngine = void 0;
const puppeteer = require("puppeteer");
class PuppeteerEngine {
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
        const launchOptions = {
            headless: this.options.headless ? 'new' : false,
            ignoreHTTPSErrors: this.options.ignoreHTTPSErrors,
            devtools: this.options.devtools,
            slowMo: this.options.slowMo,
            args: this.options.args || ['--no-sandbox', '--disable-setuid-sandbox'],
        };
        if (this.options.executablePath) {
            launchOptions.executablePath = this.options.executablePath;
        }
        this.browser = await puppeteer.launch(launchOptions);
        this.page = await this.browser.newPage();
        await this.page.setViewport({
            width: this.options.width || 1280,
            height: this.options.height || 720,
        });
        if (this.options.userAgent) {
            await this.page.setUserAgent(this.options.userAgent);
        }
        this.page.setDefaultTimeout(this.options.timeout || 30000);
        this.page.on('request', (request) => {
            this.networkRequests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                timestamp: new Date().toISOString(),
            });
        });
        if (this.options.blockResources && this.options.blockResources.length > 0) {
            await this.page.setRequestInterception(true);
            this.page.on('request', (request) => {
                const resourceType = request.resourceType();
                if (this.options.blockResources.includes(resourceType)) {
                    request.abort();
                }
                else {
                    request.continue();
                }
            });
        }
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
        const waitUntilOptions = {
            'load': 'load',
            'domcontentloaded': 'domcontentloaded',
            'networkidle': 'networkidle0'
        };
        await this.page.goto(this.page.url(), {
            waitUntil: waitUntilOptions[state],
            timeout: this.options.timeout
        });
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
        return this.page.$$eval(selector, (elements, opts) => {
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
                if (opts?.includeStyles) {
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
        }, options);
    }
    async elementExists(selector) {
        const element = await this.page.$(selector);
        return element !== null;
    }
    async isVisible(selector) {
        const element = await this.page.$(selector);
        if (!element)
            return false;
        return this.page.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0';
        }, element);
    }
    async ensurePage() {
        if (!this.page) {
            await this.initialize();
        }
    }
    async screenshot(options) {
        await this.ensurePage();
        const result = await this.page.screenshot(options);
        return result;
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
        await this.page.click(selector, { clickCount: 2, ...options });
    }
    async rightClick(selector, options) {
        await this.page.click(selector, { button: 'right', ...options });
    }
    async hover(selector) {
        await this.page.hover(selector);
    }
    async type(selector, text, options) {
        await this.page.type(selector, text, options);
    }
    async fill(selector, value) {
        await this.page.$eval(selector, (el, val) => {
            el.value = val;
        }, value);
    }
    async clear(selector) {
        await this.page.$eval(selector, (el) => {
            el.value = '';
        });
    }
    async selectOption(selector, value) {
        await this.page.select(selector, ...(Array.isArray(value) ? value : [value]));
    }
    async setChecked(selector, checked) {
        await this.page.$eval(selector, (el, isChecked) => {
            el.checked = isChecked;
        }, checked);
    }
    async uploadFiles(selector, files) {
        const element = await this.page.$(selector);
        if (element) {
            await element.uploadFile(...files);
        }
    }
    async press(key) {
        await this.page.keyboard.press(key);
    }
    async scroll(options) {
        if (options?.selector) {
            await this.page.$eval(options.selector, (el) => {
                el.scrollIntoView();
            });
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
        await this.page.setViewport({ width, height });
    }
    async addCookies(cookies) {
        await this.page.setCookie(...cookies);
    }
    async getCookies() {
        return this.page.cookies();
    }
    async clearCookies() {
        const client = await this.page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
    }
    async setGeolocation(latitude, longitude) {
        await this.page.setGeolocation({ latitude, longitude });
    }
    async blockResources(resourceTypes) {
        await this.page.setRequestInterception(true);
        this.page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (resourceTypes.includes(resourceType)) {
                request.abort();
            }
            else {
                request.continue();
            }
        });
    }
    async interceptRequests(callback) {
        await this.page.setRequestInterception(true);
        this.page.on('request', async (request) => {
            await callback(request);
            request.continue();
        });
    }
    async getNetworkRequests() {
        return this.networkRequests;
    }
    async emulateDevice(device) {
        let deviceConfig;
        if (typeof device === 'string') {
            const puppeteerDevices = puppeteer.devices;
            deviceConfig = puppeteerDevices[device];
        }
        else {
            deviceConfig = device;
        }
        if (deviceConfig) {
            await this.page.emulate(deviceConfig);
        }
    }
    async setUserAgent(userAgent) {
        await this.page.setUserAgent(userAgent);
    }
    async close() {
        if (this.page) {
            await this.page.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
    }
}
exports.PuppeteerEngine = PuppeteerEngine;
//# sourceMappingURL=puppeteer-engine.js.map