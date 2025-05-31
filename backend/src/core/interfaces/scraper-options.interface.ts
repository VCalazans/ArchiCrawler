export interface ScraperOptions {
  /**
   * Whether to run in headless mode
   */
  headless?: boolean;
  
  /**
   * Default navigation timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * User agent string
   */
  userAgent?: string;
  
  /**
   * Viewport width
   */
  width?: number;
  
  /**
   * Viewport height
   */
  height?: number;
  
  /**
   * Whether to ignore HTTPS errors
   */
  ignoreHTTPSErrors?: boolean;
  
  /**
   * Device to emulate
   */
  device?: string;
  
  /**
   * Browser executable path
   */
  executablePath?: string;
  
  /**
   * Browser arguments
   */
  args?: string[];
  
  /**
   * Whether to enable debugging
   */
  devtools?: boolean;
  
  /**
   * Slow down operations by the specified amount of milliseconds
   */
  slowMo?: number;
  
  /**
   * Locale to set
   */
  locale?: string;
  
  /**
   * Timezone to set
   */
  timezoneId?: string;
  
  /**
   * Geolocation
   */
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  
  /**
   * Permissions to grant
   */
  permissions?: string[];
  
  /**
   * Color scheme preference
   */
  colorScheme?: 'light' | 'dark' | 'no-preference';
  
  /**
   * Reduce motion preference
   */
  reducedMotion?: 'reduce' | 'no-preference';
  
  /**
   * Screen size for device emulation
   */
  screen?: {
    width: number;
    height: number;
  };
  
  /**
   * Whether to enable offline mode
   */
  offline?: boolean;
  
  /**
   * Download path for file downloads
   */
  downloadPath?: string;
  
  /**
   * HTTP credentials
   */
  httpCredentials?: {
    username: string;
    password: string;
  };
  
  /**
   * Proxy settings
   */
  proxy?: {
    server: string;
    username?: string;
    password?: string;
    bypass?: string;
  };
  
  /**
   * Video recording options
   */
  video?: {
    dir: string;
    size?: {
      width: number;
      height: number;
    };
  };
  
  /**
   * Resource types to block
   */
  blockResources?: string[];
  
  /**
   * Extra HTTP headers
   */
  extraHTTPHeaders?: Record<string, string>;
  
  /**
   * JavaScript enabled/disabled
   */
  javaScriptEnabled?: boolean;
  
  /**
   * Accept downloads automatically
   */
  acceptDownloads?: boolean;
  
  /**
   * Bypass CSP (Content Security Policy)
   */
  bypassCSP?: boolean;
  
  /**
   * Whether to record HAR (HTTP Archive)
   */
  recordHar?: {
    path: string;
    omitContent?: boolean;
  };
  
  /**
   * Whether to record video
   */
  recordVideo?: {
    dir: string;
    size?: {
      width: number;
      height: number;
    };
  };
  
  /**
   * Additional engine-specific options
   */
  [key: string]: any;
}