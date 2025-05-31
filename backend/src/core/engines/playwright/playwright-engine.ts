import { ScraperEngine } from '../../interfaces/scraper-engine.interface';
import { Browser, Page, chromium, firefox, webkit, BrowserContext, devices } from 'playwright';
import { ScraperOptions } from '../../interfaces/scraper-options.interface';

export class PlaywrightEngine implements ScraperEngine {
  private browser: Browser;
  private context: BrowserContext;
  private page: Page;
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
    // Select browser based on options or default to chromium
    const browserType = this.options.browserType || 'chromium';
    const launchOptions: any = {
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

    // Launch browser
    switch (browserType) {
      case 'firefox':
        this.browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        this.browser = await webkit.launch(launchOptions);
        break;
      default:
        this.browser = await chromium.launch(launchOptions);
    }

    // Context options
    const contextOptions: any = {
      ignoreHTTPSErrors: this.options.ignoreHTTPSErrors,
      javaScriptEnabled: this.options.javaScriptEnabled,
      acceptDownloads: this.options.acceptDownloads,
      bypassCSP: this.options.bypassCSP,
    };

    // Set viewport
    if (this.options.device) {
      const device = devices[this.options.device];
      if (device) {
        contextOptions.viewport = device.viewport;
        contextOptions.userAgent = device.userAgent;
        contextOptions.deviceScaleFactor = device.deviceScaleFactor;
        contextOptions.isMobile = device.isMobile;
        contextOptions.hasTouch = device.hasTouch;
      }
    } else {
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

    // Create context
    this.context = await this.browser.newContext(contextOptions);
    
    // Block resources if specified
    if (this.options.blockResources && this.options.blockResources.length > 0) {
      await this.context.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        if (this.options.blockResources.includes(resourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });
    }

    this.page = await this.context.newPage();
    
    // Set default timeout
    this.page.setDefaultTimeout(this.options.timeout);

    // Track network requests
    this.page.on('request', (request) => {
      this.networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString(),
      });
    });
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
    await this.page.waitForLoadState(state);
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
    return this.page.$$eval(selector, (elements) => {
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
        if (options?.includeStyles) {
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
    });
  }

  async elementExists(selector: string): Promise<boolean> {
    const element = await this.page.$(selector);
    return element !== null;
  }

  async isVisible(selector: string): Promise<boolean> {
    const element = await this.page.$(selector);
    if (!element) return false;
    return await element.isVisible();
  }

  async screenshot(options?: any): Promise<Buffer> {
    return this.page.screenshot(options);
  }

  async pdf(options?: any): Promise<Buffer> {
    return this.page.pdf(options);
  }

  async evaluate<T>(script: string | Function): Promise<T> {
    return this.page.evaluate(script as any);
  }

  async click(selector: string, options?: any): Promise<void> {
    await this.page.click(selector, options);
  }

  async doubleClick(selector: string, options?: any): Promise<void> {
    await this.page.dblclick(selector, options);
  }

  async rightClick(selector: string, options?: any): Promise<void> {
    await this.page.click(selector, { ...options, button: 'right' });
  }

  async hover(selector: string): Promise<void> {
    await this.page.hover(selector);
  }

  async type(selector: string, text: string, options?: any): Promise<void> {
    await this.page.type(selector, text, options);
  }

  async fill(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  async clear(selector: string): Promise<void> {
    await this.page.fill(selector, '');
  }

  async selectOption(selector: string, value: string | string[]): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  async setChecked(selector: string, checked: boolean): Promise<void> {
    await this.page.setChecked(selector, checked);
  }

  async uploadFiles(selector: string, files: string[] | Buffer[]): Promise<void> {
    await this.page.setInputFiles(selector, files as any);
  }

  async press(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  async scroll(options?: any): Promise<void> {
    if (options?.selector) {
      await this.page.locator(options.selector).scrollIntoViewIfNeeded();
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
    await this.page.setViewportSize({ width, height });
  }

  async addCookies(cookies: any[]): Promise<void> {
    await this.context.addCookies(cookies);
  }

  async getCookies(): Promise<any[]> {
    return this.context.cookies();
  }

  async clearCookies(): Promise<void> {
    await this.context.clearCookies();
  }

  async setGeolocation(latitude: number, longitude: number): Promise<void> {
    await this.context.setGeolocation({ latitude, longitude });
  }

  async blockResources(resourceTypes: string[]): Promise<void> {
    await this.context.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (resourceTypes.includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  async interceptRequests(callback: (request: any) => Promise<void>): Promise<void> {
    await this.context.route('**/*', async (route) => {
      await callback(route.request());
      route.continue();
    });
  }

  async getNetworkRequests(): Promise<any[]> {
    return this.networkRequests;
  }

  async emulateDevice(device: string | any): Promise<void> {
    let deviceConfig;
    if (typeof device === 'string') {
      deviceConfig = devices[device];
    } else {
      deviceConfig = device;
    }

    if (deviceConfig) {
      await this.page.setViewportSize(deviceConfig.viewport);
      // Create new context with device settings
      const newContext = await this.browser.newContext({
        ...deviceConfig,
        userAgent: deviceConfig.userAgent
      });
      this.context = newContext;
      this.page = await this.context.newPage();
    }
  }

  async setUserAgent(userAgent: string): Promise<void> {
    // Create new context with user agent
    const newContext = await this.browser.newContext({
      userAgent: userAgent
    });
    this.context = newContext;
    this.page = await this.context.newPage();
  }

  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}