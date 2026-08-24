import { InjectionToken } from '@angular/core';

/**
 * Abstraction over an XHR interceptor used to authenticate raw XHR requests
 * (e.g. OpenLayers tile/feature loaders), which bypass Angular's
 * `HttpClient` and `HTTP_INTERCEPTORS`.
 */
export interface IXhrInterceptor {
  interceptXhr(xhr: XMLHttpRequest, url: string): boolean;
  alterUrlWithKeyAuth(url: string): string | undefined;
}

export const XHR_INTERCEPTOR = new InjectionToken<IXhrInterceptor>(
  'XHR_INTERCEPTOR'
);
