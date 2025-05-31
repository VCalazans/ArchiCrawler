export interface ScraperOptions {
    headless?: boolean;
    timeout?: number;
    userAgent?: string;
    width?: number;
    height?: number;
    ignoreHTTPSErrors?: boolean;
    device?: string;
    executablePath?: string;
    args?: string[];
    devtools?: boolean;
    slowMo?: number;
    locale?: string;
    timezoneId?: string;
    geolocation?: {
        latitude: number;
        longitude: number;
        accuracy?: number;
    };
    permissions?: string[];
    colorScheme?: 'light' | 'dark' | 'no-preference';
    reducedMotion?: 'reduce' | 'no-preference';
    screen?: {
        width: number;
        height: number;
    };
    offline?: boolean;
    downloadPath?: string;
    httpCredentials?: {
        username: string;
        password: string;
    };
    proxy?: {
        server: string;
        username?: string;
        password?: string;
        bypass?: string;
    };
    video?: {
        dir: string;
        size?: {
            width: number;
            height: number;
        };
    };
    blockResources?: string[];
    extraHTTPHeaders?: Record<string, string>;
    javaScriptEnabled?: boolean;
    acceptDownloads?: boolean;
    bypassCSP?: boolean;
    recordHar?: {
        path: string;
        omitContent?: boolean;
    };
    recordVideo?: {
        dir: string;
        size?: {
            width: number;
            height: number;
        };
    };
    [key: string]: any;
}
