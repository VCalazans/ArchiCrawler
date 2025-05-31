export interface PageChange {
    type: 'element_added' | 'element_removed' | 'content_changed' | 'url_changed';
    element?: string;
    oldValue?: string;
    newValue?: string;
    timestamp: Date;
}
export interface PerformanceMetrics {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
    networkRequests: number;
    errors: string[];
}
export interface FormInfo {
    selector: string;
    id?: string;
    name?: string;
    action?: string;
    method?: string;
    fields: FormField[];
}
export interface FormField {
    selector: string;
    type: string;
    name?: string;
    id?: string;
    placeholder?: string;
    required: boolean;
    value?: string;
}
export interface ButtonInfo {
    selector: string;
    text: string;
    type?: string;
    id?: string;
    class?: string;
    isVisible: boolean;
    isEnabled: boolean;
}
export interface LinkInfo {
    selector: string;
    text: string;
    href?: string;
    id?: string;
    class?: string;
    isVisible: boolean;
}
export interface DOMElement {
    selector: string;
    tagName: string;
    text?: string;
    attributes: Record<string, string>;
    isVisible: boolean;
}
