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
      width: this.options.width || 1280,
      height: this.options.height || 720,
    });
    
    // Set user agent if provided
    if (this.options.userAgent) {
      await this.page.setUserAgent(this.options.userAgent);
    }
    
    // Set default timeout
    this.page.setDefaultTimeout(this.options.timeout || 30000);

    // Track network requests
    this.page.on('request', (request) => {
      this.networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString(),
      });
    });

    // Block resources if specified
    if (this.options.blockResources && this.options.blockResources.length > 0) {
      await this.page.setRequestInterception(true);
      this.page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (this.options.blockResources!.includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });
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
    const waitUntilOptions: any = {
      'load': 'load',
      'domcontentloaded': 'domcontentloaded',
      'networkidle': 'networkidle0'
    };
    
    await this.page.goto(this.page.url(), { 
      waitUntil: waitUntilOptions[state] as any,
      timeout: this.options.timeout 
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
    const element = await this.page.$(selector);
    if (!element) return false;
    
    return this.page.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0';
    }, element);
  }  private async ensurePage(): Promise<void> {
    if (!this.page) {
      await this.initialize();
    }
  }

  async screenshot(options?: any): Promise<Buffer> {
    await this.ensurePage();
    const result = await this.page.screenshot(options);
    return result as unknown as Buffer;
  }

  async pdf(options?: any): Promise<Buffer> {
    return this.page.pdf(options) as Promise<Buffer>;
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
    await this.page.$eval(selector, (el: any, val) => {
      el.value = val;
    }, value);
  }

  async clear(selector: string): Promise<void> {
    await this.page.$eval(selector, (el: any) => {
      el.value = '';
    });
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
    const element = await this.page.$(selector);
    if (element) {
      await (element as any).uploadFile(...(files as string[]));
    }
  }

  async press(key: string): Promise<void> {
    await this.page.keyboard.press(key as any);
  }

  async scroll(options?: any): Promise<void> {
    if (options?.selector) {
      await this.page.$eval(options.selector, (el) => {
        el.scrollIntoView();
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
    const client = await this.page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
  }

  async setGeolocation(latitude: number, longitude: number): Promise<void> {
    await this.page.setGeolocation({ latitude, longitude });
  }

  async blockResources(resourceTypes: string[]): Promise<void> {
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (resourceTypes.includes(resourceType)) {
        request.abort();
      } else {
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
    let deviceConfig;
    if (typeof device === 'string') {
      // For Puppeteer, we need to use puppeteer.devices instead of playwright devices
      const puppeteerDevices = puppeteer.devices;
      deviceConfig = puppeteerDevices[device];
    } else {
      deviceConfig = device;
    }

    if (deviceConfig) {
      await this.page.emulate(deviceConfig);
    }
  }

  async setUserAgent(userAgent: string): Promise<void> {
    await this.page.setUserAgent(userAgent);
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}