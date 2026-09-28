import {
  HttpErrorResponse,
  HttpHandler,
  HttpRequest,
  provideHttpClient
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EMPTY, Observable, throwError } from 'rxjs';

import { AuthInterceptor } from './auth.interceptor';
import { AUTH_OPTIONS } from './auth.interface';
import { AuthService } from './auth.service';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'auth/login', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AUTH_OPTIONS,
          useValue: {
            url: '/auth',
            tokenKey: 'auth-token',
            loginRoute: 'auth/login'
          }
        }
      ]
    });

    interceptor = TestBed.inject(AuthInterceptor);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('should expire the session when refresh fails', () => {
    const expireSessionSpy = vi.spyOn(authService, 'expireSession');
    const token = createToken(Math.floor(Date.now() / 1000) + 60);
    const handler: HttpHandler = {
      handle: () => new Observable()
    };

    localStorage.setItem('auth-token', token);
    interceptor
      .intercept(new HttpRequest('GET', `${location.origin}/api/data`), handler)
      .subscribe({ error: () => undefined });

    const req = httpMock.expectOne('/auth/refresh');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(expireSessionSpy).toHaveBeenCalled();
  });

  it('should share one refresh request between concurrent callers', () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 60);
    const handler: HttpHandler = {
      handle: () => new Observable()
    };

    localStorage.setItem('auth-token', token);
    interceptor
      .intercept(new HttpRequest('GET', `${location.origin}/api/one`), handler)
      .subscribe({ error: () => undefined });
    interceptor
      .intercept(new HttpRequest('GET', `${location.origin}/api/two`), handler)
      .subscribe({ error: () => undefined });

    const requests = httpMock.match('/auth/refresh');

    expect(requests).toHaveLength(1);

    requests[0].flush({ token: createToken(Date.now() / 1000 + 3600) });
  });

  it('should wait for refresh and forward the request with the new token', () => {
    const currentToken = createToken(Math.floor(Date.now() / 1000) + 60);
    const refreshedToken = createToken(Math.floor(Date.now() / 1000) + 3600);
    let forwardedRequest: HttpRequest<unknown> | undefined;
    const handler: HttpHandler = {
      handle: (request) => {
        forwardedRequest = request;
        return EMPTY;
      }
    };

    localStorage.setItem('auth-token', currentToken);
    interceptor
      .intercept(new HttpRequest('GET', `${location.origin}/api/data`), handler)
      .subscribe();

    expect(forwardedRequest).toBeUndefined();

    httpMock.expectOne('/auth/refresh').flush({ token: refreshedToken });

    expect(forwardedRequest?.headers.get('Authorization')).toBe(
      `Bearer ${refreshedToken}`
    );
  });

  it('should wait for refresh before preparing a trusted XHR request', async () => {
    const refreshedToken = createToken(Math.floor(Date.now() / 1000) + 3600);
    let prepared = false;

    localStorage.setItem(
      'auth-token',
      createToken(Math.floor(Date.now() / 1000) + 60)
    );
    const preparation = interceptor
      .prepareXhr(`${location.origin}/api/data`)
      .then((result) => {
        prepared = result;
        return result;
      });

    expect(prepared).toBe(false);

    httpMock.expectOne('/auth/refresh').flush({ token: refreshedToken });

    await expect(preparation).resolves.toBe(true);
    expect(prepared).toBe(true);
  });

  it('should not expire the session when a valid token request returns unauthorized', () => {
    const expireSessionSpy = vi.spyOn(authService, 'expireSession');
    const token = createToken(Math.floor(Date.now() / 1000) + 3600);
    const handler: HttpHandler = {
      handle: () =>
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              statusText: 'Unauthorized'
            })
        )
    };

    localStorage.setItem('auth-token', token);
    interceptor
      .intercept(new HttpRequest('GET', `${location.origin}/api/data`), handler)
      .subscribe({ error: () => undefined });

    expect(expireSessionSpy).not.toHaveBeenCalled();
  });

  it('should forward authentication requests when the stored token is expired', () => {
    const expireSessionSpy = vi.spyOn(authService, 'expireSession');
    let forwarded = false;
    const handler: HttpHandler = {
      handle: () => {
        forwarded = true;
        return new Observable();
      }
    };

    localStorage.setItem(
      'auth-token',
      createToken(Math.floor(Date.now() / 1000) - 60)
    );
    interceptor.intercept(new HttpRequest('GET', '/auth/login'), handler);

    expect(forwarded).toBe(true);
    expect(expireSessionSpy).not.toHaveBeenCalled();
  });

  it('should not refresh for an untrusted near-expiry request', () => {
    let forwarded = false;
    const handler: HttpHandler = {
      handle: () => {
        forwarded = true;
        return new Observable();
      }
    };

    localStorage.setItem(
      'auth-token',
      createToken(Math.floor(Date.now() / 1000) + 60)
    );
    interceptor.intercept(
      new HttpRequest('GET', 'https://untrusted.example/data'),
      handler
    );

    expect(forwarded).toBe(true);
    expect(httpMock.match('/auth/refresh')).toHaveLength(0);
  });

  it('should expire the session before sending a request with an expired token', () => {
    const expireSessionSpy = vi.spyOn(authService, 'expireSession');
    const token = createToken(Math.floor(Date.now() / 1000) - 60);
    const handler: HttpHandler = {
      handle: () => new Observable()
    };

    localStorage.setItem('auth-token', token);
    interceptor.intercept(
      new HttpRequest('GET', `${location.origin}/api/data`),
      handler
    );

    expect(expireSessionSpy).toHaveBeenCalled();
  });

  it('should expire the session when the token has no expiration', () => {
    const expireSessionSpy = vi.spyOn(authService, 'expireSession');
    const handler: HttpHandler = {
      handle: () => new Observable()
    };

    localStorage.setItem('auth-token', createToken());
    interceptor.intercept(
      new HttpRequest('GET', `${location.origin}/api/data`),
      handler
    );

    expect(expireSessionSpy).toHaveBeenCalled();
  });

  it('should expire the session for non-authentication routes ending with refresh', () => {
    const expireSessionSpy = vi.spyOn(authService, 'expireSession');
    const token = createToken(Math.floor(Date.now() / 1000) - 60);
    const handler: HttpHandler = {
      handle: () =>
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              statusText: 'Unauthorized'
            })
        )
    };

    localStorage.setItem('auth-token', token);
    interceptor
      .intercept(
        new HttpRequest('GET', `${location.origin}/api/refresh`),
        handler
      )
      .subscribe({ error: () => undefined });

    expect(expireSessionSpy).toHaveBeenCalled();
  });

  function createToken(exp?: number): string {
    return [
      btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })),
      btoa(JSON.stringify({ ...(exp === undefined ? {} : { exp }), user: {} })),
      ''
    ].join('.');
  }
});
