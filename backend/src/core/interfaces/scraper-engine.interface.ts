export interface ScraperEngine {
  /**
   * Initialize the scraper engine
   */
  initialize(): Promise<void>;
  
  /**
   * Navigate to a URL
   * @param url The URL to navigate to
   */
  navigate(url: string): Promise<void>;
  
  /**
   * Wait for the specified time
   * @param milliseconds Time to wait in milliseconds
   */
  wait(milliseconds: number): Promise<void>;
  
  /**
   * Wait for a selector to appear in the page
   * @param selector The CSS selector to wait for
   * @param options Optional wait options
   */
  waitForSelector(selector: string, options?: any): Promise<void>;
  
  /**
   * Wait for network to be idle
   * @param options Wait options
   */
  waitForLoadState(state?: 'load' | 'domcontentloaded' | 'networkidle'): Promise<void>;
  
  /**
   * Get text content from elements matching the selector
   * @param selector CSS selector
   */
  getText(selector: string): Promise<string[]>;
  
  /**
   * Get attributes from elements matching the selector
   * @param selector CSS selector
   * @param attributeName Attribute name
   */
  getAttribute(selector: string, attributeName: string): Promise<string[]>;
  
  /**
   * Get element properties
   * @param selector CSS selector
   * @param propertyName Property name
   */
  getProperty(selector: string, propertyName: string): Promise<any[]>;
  
  /**
   * Get all element data (text, attributes, properties)
   * @param selector CSS selector
   * @param options Options for data extraction
   */
  getElementData(selector: string, options?: any): Promise<any[]>;
  
  /**
   * Check if element exists
   * @param selector CSS selector
   */
  elementExists(selector: string): Promise<boolean>;
  
  /**
   * Check if element is visible
   * @param selector CSS selector
   */
  isVisible(selector: string): Promise<boolean>;
  
  /**
   * Take a screenshot of the current page
   * @param options Screenshot options
   */
  screenshot(options?: any): Promise<Buffer>;
  
  /**
   * Generate a PDF of the current page
   * @param options PDF options
   */
  pdf(options?: any): Promise<Buffer>;
  
  /**
   * Execute JavaScript in the page context
   * @param script JavaScript to execute
   */
  evaluate<T>(script: string | Function): Promise<T>;
  
  /**
   * Click on an element matching the selector
   * @param selector CSS selector
   * @param options Click options
   */
  click(selector: string, options?: any): Promise<void>;
  
  /**
   * Double click on an element
   * @param selector CSS selector
   * @param options Click options
   */
  doubleClick(selector: string, options?: any): Promise<void>;
  
  /**
   * Right click on an element
   * @param selector CSS selector
   * @param options Click options
   */
  rightClick(selector: string, options?: any): Promise<void>;
  
  /**
   * Hover over an element
   * @param selector CSS selector
   */
  hover(selector: string): Promise<void>;
  
  /**
   * Type text into an element matching the selector
   * @param selector CSS selector
   * @param text Text to type
   * @param options Type options
   */
  type(selector: string, text: string, options?: any): Promise<void>;
  
  /**
   * Fill an input element
   * @param selector CSS selector
   * @param value Value to fill
   */
  fill(selector: string, value: string): Promise<void>;
  
  /**
   * Clear an input element
   * @param selector CSS selector
   */
  clear(selector: string): Promise<void>;
  
  /**
   * Select option from dropdown
   * @param selector CSS selector
   * @param value Value to select
   */
  selectOption(selector: string, value: string | string[]): Promise<void>;
  
  /**
   * Check/uncheck a checkbox or radio button
   * @param selector CSS selector
   * @param checked Whether to check or uncheck
   */
  setChecked(selector: string, checked: boolean): Promise<void>;
  
  /**
   * Upload files to an input element
   * @param selector CSS selector
   * @param files File paths or buffer data
   */
  uploadFiles(selector: string, files: string[] | Buffer[]): Promise<void>;
  
  /**
   * Press keyboard key
   * @param key Key to press
   */
  press(key: string): Promise<void>;
  
  /**
   * Scroll page or element
   * @param options Scroll options
   */
  scroll(options?: any): Promise<void>;
  
  /**
   * Get current page URL
   */
  getCurrentUrl(): Promise<string>;
  
  /**
   * Get page title
   */
  getTitle(): Promise<string>;
  
  /**
   * Go back in browser history
   */
  goBack(): Promise<void>;
  
  /**
   * Go forward in browser history
   */
  goForward(): Promise<void>;
  
  /**
   * Reload the page
   */
  reload(): Promise<void>;
  
  /**
   * Set viewport size
   * @param width Width in pixels
   * @param height Height in pixels
   */
  setViewport(width: number, height: number): Promise<void>;
  
  /**
   * Add cookies to the page
   * @param cookies Array of cookie objects
   */
  addCookies(cookies: any[]): Promise<void>;
  
  /**
   * Get all cookies
   */
  getCookies(): Promise<any[]>;
  
  /**
   * Clear all cookies
   */
  clearCookies(): Promise<void>;
  
  /**
   * Set geolocation
   * @param latitude Latitude
   * @param longitude Longitude
   */
  setGeolocation(latitude: number, longitude: number): Promise<void>;
  
  /**
   * Block/unblock resources
   * @param resourceTypes Array of resource types to block
   */
  blockResources(resourceTypes: string[]): Promise<void>;
  
  /**
   * Intercept network requests
   * @param callback Callback function to handle requests
   */
  interceptRequests(callback: (request: any) => Promise<void>): Promise<void>;
  
  /**
   * Get network requests
   */
  getNetworkRequests(): Promise<any[]>;
  
  /**
   * Emulate device
   * @param device Device name or configuration
   */
  emulateDevice(device: string | any): Promise<void>;
  
  /**
   * Set user agent
   * @param userAgent User agent string
   */
  setUserAgent(userAgent: string): Promise<void>;
  
  /**
   * Close the browser and release resources
   */
  close(): Promise<void>;
}