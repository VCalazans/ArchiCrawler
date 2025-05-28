import { ScraperEngine } from '../../interfaces/scraper-engine.interface';
import { ScraperOptions } from '../../interfaces/scraper-options.interface';
import * as puppeteer from 'puppeteer';

export class PuppeteerEngine implements ScraperEngine {
  private browser: puppeteer.Browser;
  private page: puppeteer.Page;
  private options: ScraperOptions;
  private networkRequests: any[] = [];

  constructor(options?: ScraperOptions) {
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

  async initialize(): Promise<void> {
    const launchOptions: any = {
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
    
    // Set viewport
    await this.page.setViewport({
      width: this.options.width,
      height: this.options.height,
    });
    
    // Set user agent if provided
    if (this.options.userAgent) {
      await this.page.setUserAgent(this.options.userAgent);
    }
    
    // Set default timeout
    this.page.setDefaultTimeout(this.options.timeout);

    // Set up JavaScript enabled/disabled
    await this.page.setJavaScriptEnabled(this.options.javaScriptEnabled);

    // Set up request interception for network tracking
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      this.networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString(),
      });
      request.continue();
    });

    // Set extra HTTP headers if provided
    if (this.options.extraHTTPHeaders) {
      await this.page.setExtraHTTPHeaders(this.options.extraHTTPHeaders);
    }

    // Set HTTP credentials if provided
    if (this.options.httpCredentials) {
      await this.page.authenticate(this.options.httpCredentials);
    }

    // Set geolocation if provided
    if (this.options.geolocation) {
      await this.page.setGeolocation(this.options.geolocation);
    }

    // Emulate timezone if provided
    if (this.options.timezoneId) {
      await this.page.emulateTimezone(this.options.timezoneId);
    }

    // Set media features if provided
    if (this.options.colorScheme) {
      await this.page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: this.options.colorScheme }
      ]);
    }

    if (this.options.reducedMotion) {
      await this.page.emulateMediaFeatures([
        { name: 'prefers-reduced-motion', value: this.options.reducedMotion }
      ]);
    }
  }

  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: this.options.timeout,
    });
  }

  async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }

  async waitForSelector(selector: string, options?: any): Promise<void> {
    await this.page.waitForSelector(selector, options);
  }

  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
    const waitUntilMap = {
      'load': 'load' as const,
      'domcontentloaded': 'domcontentloaded' as const,
      'networkidle': 'networkidle0' as const,
    };
    
    await this.page.goto(this.page.url(), { 
      waitUntil: waitUntilMap[state],
      timeout: this.options.timeout,
    });
  }

  async getText(selector: string): Promise<string[]> {
    return this.page.$$eval(selector, (elements) => 
      elements.map((el) => el.textContent?.trim() || '')
    );
  }

  async getAttribute(selector: string, attributeName: string): Promise<string[]> {
    return this.page.$$eval(
      selector,
      (elements, attr) => elements.map((el) => el.getAttribute(attr) || ''),
      attributeName
    );
  }

  async getProperty(selector: string, propertyName: string): Promise<any[]> {
    return this.page.$$eval(
      selector,
      (elements, prop) => elements.map((el) => (el as any)[prop]),
      propertyName
    );
  }

  async getElementData(selector: string, options?: any): Promise<any[]> {
    return this.page.$$eval(selector, (elements, opts) => {
      return elements.map((el) => {
        const data: any = {
          text: el.textContent?.trim() || '',
          innerHTML: el.innerHTML,
          outerHTML: el.outerHTML,
          tagName: el.tagName.toLowerCase(),
        };

        // Get all attributes
        data.attributes = {};
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          data.attributes[attr.name] = attr.value;
        }

        // Get computed styles if requested
        if (opts?.includeStyles) {
          const computedStyle = window.getComputedStyle(el);
          data.styles = {};
          for (let i = 0; i < computedStyle.length; i++) {
            const prop = computedStyle[i];
            data.styles[prop] = computedStyle.getPropertyValue(prop);
          }
        }

        // Get bounding box
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

  async elementExists(selector: string): Promise<boolean> {
    const element = await this.page.$(selector);
    return element !== null;
  }

  async isVisible(selector: string): Promise<boolean> {
    return this.page.$eval(selector, (el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }).catch(() => false);
  }

  async screenshot(options?: any): Promise<Buffer> {
    return this.page.screenshot(options as puppeteer.ScreenshotOptions);
  }

  async pdf(options?: any): Promise<Buffer> {
    return this.page.pdf(options as puppeteer.PDFOptions);
  }

  async evaluate<T>(script: string | Function): Promise<T> {
    return this.page.evaluate(script as any);
  }

  async click(selector: string, options?: any): Promise<void> {
    await this.page.click(selector, options);
  }

  async doubleClick(selector: string, options?: any): Promise<void> {
    await this.page.click(selector, { clickCount: 2, ...options });
  }

  async rightClick(selector: string, options?: any): Promise<void> {
    await this.page.click(selector, { button: 'right', ...options });
  }

  async hover(selector: string): Promise<void> {
    await this.page.hover(selector);
  }

  async type(selector: string, text: string, options?: any): Promise<void> {
    await this.page.type(selector, text, options);
  }

  async fill(selector: string, value: string): Promise<void> {
    await this.page.$eval(selector, (el: any, val) => { el.value = val; }, value);
    await this.page.type(selector, ''); // Trigger change event
  }

  async clear(selector: string): Promise<void> {
    await this.page.$eval(selector, (el: any) => { el.value = ''; });
  }

  async selectOption(selector: string, value: string | string[]): Promise<void> {
    await this.page.select(selector, ...(Array.isArray(value) ? value : [value]));
  }

  async setChecked(selector: string, checked: boolean): Promise<void> {
    await this.page.$eval(selector, (el: any, isChecked) => {
      el.checked = isChecked;
    }, checked);
  }
  async uploadFiles(selector: string, files: string[] | Buffer[]): Promise<void> {
    const fileInputElement = await this.page.$(selector);
    if (fileInputElement) {
      await (fileInputElement as any).uploadFile(...(files as string[]));
    }
  }

  async press(key: string): Promise<void> {
    await this.page.keyboard.press(key as any);
  }

  async scroll(options?: any): Promise<void> {
    if (options?.selector) {
      await this.page.$eval(options.selector, (el) => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } else {
      await this.page.evaluate((scrollOptions) => {
        window.scrollTo(scrollOptions);
      }, options || { top: 0, left: 0 });
    }
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  async goForward(): Promise<void> {
    await this.page.goForward();
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewport({ width, height });
  }

  async addCookies(cookies: any[]): Promise<void> {
    await this.page.setCookie(...cookies);
  }

  async getCookies(): Promise<any[]> {
    return this.page.cookies();
  }

  async clearCookies(): Promise<void> {
    const cookies = await this.page.cookies();
    await this.page.deleteCookie(...cookies);
  }

  async setGeolocation(latitude: number, longitude: number): Promise<void> {
    await this.page.setGeolocation({ latitude, longitude });
  }

  async blockResources(resourceTypes: string[]): Promise<void> {
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      if (resourceTypes.includes(request.resourceType())) {
        request.abort();
      } else {
        this.networkRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          timestamp: new Date().toISOString(),
        });
        request.continue();
      }
    });
  }

  async interceptRequests(callback: (request: any) => Promise<void>): Promise<void> {
    await this.page.setRequestInterception(true);
    this.page.on('request', async (request) => {
      await callback(request);
      request.continue();
    });
  }

  async getNetworkRequests(): Promise<any[]> {
    return this.networkRequests;
  }

  async emulateDevice(device: string | any): Promise<void> {
    if (typeof device === 'string') {
      // Puppeteer has predefined devices
      const puppeteerDevices = puppeteer.devices;
      const deviceConfig = puppeteerDevices[device];
      if (deviceConfig) {
        await this.page.emulate(deviceConfig);
      }
    } else {
      await this.page.emulate(device);
    }
  }

  async setUserAgent(userAgent: string): Promise<void> {
    await this.page.setUserAgent(userAgent);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
