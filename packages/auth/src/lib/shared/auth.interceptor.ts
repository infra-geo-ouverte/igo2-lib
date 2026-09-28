import { DOCUMENT, Location } from '@angular/common';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { Injectable, Injector, inject } from '@angular/core';

import { IXhrInterceptor } from '@igo2/core/auth';

import {
  EMPTY,
  MonoTypeOperatorFunction,
  Observable,
  firstValueFrom,
  throwError
} from 'rxjs';
import { catchError, finalize, shareReplay, switchMap } from 'rxjs/operators';
import { Md5 } from 'ts-md5';

import {
  AUTH_OPTIONS,
  AuthByKeyOptions,
  AuthOptions,
  WithCredentialsOptions
} from './auth.interface';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor, IXhrInterceptor {
  private tokenService = inject(TokenService);
  private injector = inject(Injector);
  private document = inject(DOCUMENT);
  private location = inject(Location);

  private authOptions: AuthOptions;
  private refreshRequest$?: Observable<unknown>;
  private trustHosts: string[];
  private hostsWithCredentials: WithCredentialsOptions[];
  private hostsWithAuthByKey: AuthByKeyOptions[];

  constructor() {
    this.authOptions = inject(AUTH_OPTIONS);

    this.trustHosts = this.authOptions?.trustHosts || [];
    const applicationUrl = new URL(
      this.location.prepareExternalUrl('/'),
      this.document.baseURI
    );
    if (!this.trustHosts.includes(applicationUrl.hostname)) {
      this.trustHosts.push(applicationUrl.hostname);
    }

    this.hostsWithCredentials = this.authOptions?.hostsWithCredentials || [];
    this.hostsWithAuthByKey = this.authOptions?.hostsByKey || [];
  }

  intercept(
    originalReq: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const withCredentials = this.handleHostsWithCredentials(originalReq.url);
    let req = originalReq.clone();
    const hostWithKey = this.handleHostsAuthByKey(originalReq.url);
    if (hostWithKey) {
      req = req.clone({
        params: req.params.set(hostWithKey.key, hostWithKey.value)
      });
    }
    if (withCredentials) {
      req = originalReq.clone({
        withCredentials
      });
      return next.handle(req).pipe(this.catchUnauthorized(req));
    }
    const isAuthenticationRequest = this.isAuthenticationRequest(req.url);
    if (isAuthenticationRequest) {
      return next.handle(req).pipe(this.catchUnauthorized(req));
    }

    const refresh$ = this.isTrustedHost(req.url)
      ? this.refreshToken()
      : undefined;
    if (refresh$) {
      return refresh$.pipe(switchMap(() => this.forwardRequest(req, next)));
    }

    return this.forwardRequest(req, next);
  }

  private forwardRequest(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.tokenService.get();
    const element = document.createElement('a');
    element.href = req.url;

    if (!token || this.trustHosts.indexOf(element.hostname) === -1) {
      return next.handle(req);
    }

    const authHeader = `Bearer ${token}`;
    let authReq = req.clone({
      headers: req.headers.set('Authorization', authHeader)
    });

    const tokenDecoded = this.tokenService.decode();
    if (authReq.params.get('_i') === 'true' && tokenDecoded?.user?.sourceId) {
      const hashUser = Md5.hashStr(tokenDecoded.user.sourceId) as string;
      authReq = authReq.clone({
        params: authReq.params.set('_i', hashUser)
      });
    } else if (authReq.params.get('_i') === 'true') {
      authReq = authReq.clone({
        params: authReq.params.delete('_i')
      });
    }

    return next.handle(authReq).pipe(this.catchUnauthorized(authReq));
  }

  async prepareXhr(url: string): Promise<boolean> {
    if (
      this.handleHostsWithCredentials(url) ||
      this.isAuthenticationRequest(url) ||
      !this.isTrustedHost(url)
    ) {
      return true;
    }

    const status = this.tokenService.getStatus();
    if (status === 'expired') {
      this.expireSession();
      return false;
    }

    if (status !== 'near-expiry') {
      return true;
    }

    const refresh$ = this.refreshToken();
    if (!refresh$) {
      return true;
    }

    try {
      await firstValueFrom(refresh$);
      return true;
    } catch {
      return false;
    }
  }

  interceptXhr(xhr: XMLHttpRequest, url: string): boolean {
    const withCredentials = this.handleHostsWithCredentials(url);
    if (withCredentials) {
      xhr.withCredentials = withCredentials;
      return true;
    }

    if (!this.isAuthenticationRequest(url)) {
      this.refreshToken()?.subscribe({ error: () => undefined });
    }
    const element = document.createElement('a');
    element.href = url;

    const token = this.tokenService.get();
    if (!token || this.trustHosts.indexOf(element.hostname) === -1) {
      return false;
    }
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    return true;
  }

  alterUrlWithKeyAuth(url: string): string | undefined {
    const hostWithKey = this.handleHostsAuthByKey(url);
    const interceptedUrl = url;
    if (hostWithKey) {
      const urlDecomposed = interceptedUrl.split(/[?&]/);
      let urlWithKeyAdded = urlDecomposed.shift();
      const paramsToKeep = urlDecomposed.filter((p) => p.length !== 0);
      paramsToKeep.push(`${hostWithKey.key}=${hostWithKey.value}`);
      if (paramsToKeep.length) {
        urlWithKeyAdded += '?' + paramsToKeep.join('&');
      }
      return urlWithKeyAdded;
    }
    return;
  }

  private handleHostsWithCredentials(reqUrl: string) {
    let withCredentials = false;
    for (const hostWithCredentials of this.hostsWithCredentials) {
      if (!hostWithCredentials.domainRegFilters) {
        return;
      }
      const domainRegex = new RegExp(hostWithCredentials.domainRegFilters);
      if (domainRegex.test(reqUrl)) {
        withCredentials =
          hostWithCredentials.withCredentials !== undefined
            ? hostWithCredentials.withCredentials
            : false;
        break;
      }
    }
    return withCredentials;
  }

  private handleHostsAuthByKey(
    reqUrl: string
  ): { key: string; value: string } | undefined {
    let hostWithKey: { key: string; value: string } | undefined;
    for (const hostWithAuthByKey of this.hostsWithAuthByKey) {
      if (!hostWithAuthByKey.domainRegFilters) {
        return;
      }
      const domainRegex = new RegExp(hostWithAuthByKey.domainRegFilters);
      if (domainRegex.test(reqUrl)) {
        const replace = `${hostWithAuthByKey.keyProperty}=${hostWithAuthByKey.keyValue}`;
        const keyAdded = new RegExp(replace, 'gm');
        if (!keyAdded.test(reqUrl)) {
          hostWithKey = {
            key: hostWithAuthByKey.keyProperty,
            value: hostWithAuthByKey.keyValue
          };
          break;
        }
      }
    }
    return hostWithKey;
  }

  private catchUnauthorized(
    req: HttpRequest<unknown>
  ): MonoTypeOperatorFunction<HttpEvent<unknown>> {
    return catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !this.isAuthenticationRequest(req.url) &&
        this.tokenService.isExpired()
      ) {
        this.expireSession();
      }

      return throwError(() => error);
    });
  }

  private isAuthenticationRequest(url: string): boolean {
    const requestUrl = new URL(url, this.document.baseURI);
    const loginUrl = this.createAuthenticationUrl('login');
    const refreshUrl = this.createAuthenticationUrl('refresh');

    return [loginUrl, refreshUrl].some(
      (authenticationUrl) =>
        requestUrl.origin === authenticationUrl.origin &&
        requestUrl.pathname === authenticationUrl.pathname
    );
  }

  private createAuthenticationUrl(path: 'login' | 'refresh'): URL {
    const authUrl = this.authOptions.url.replace(/\/+$/, '');
    return new URL(`${authUrl}/${path}`, this.document.baseURI);
  }

  private isTrustedHost(url: string): boolean {
    const parsedUrl = new URL(url, this.document.baseURI);
    return this.trustHosts.includes(parsedUrl.hostname);
  }

  private expireSession(): void {
    this.injector.get(AuthService).expireSession();
  }

  private refreshToken(): Observable<unknown> | undefined {
    const status = this.tokenService.getStatus();

    if (status === 'missing' || status === 'valid') {
      return;
    }

    if (status === 'expired') {
      this.expireSession();
      return EMPTY;
    }

    if (!this.refreshRequest$) {
      const authService = this.injector.get(AuthService);
      this.refreshRequest$ = authService.refresh().pipe(
        finalize(() => (this.refreshRequest$ = undefined)),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }

    return this.refreshRequest$;
  }
}

export const authInterceptorFn: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const interceptor = inject(AuthInterceptor);
  const handler: HttpHandler = { handle: next };
  return interceptor.intercept(req, handler);
};
