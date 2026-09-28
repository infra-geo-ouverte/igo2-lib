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

import { throwError } from 'rxjs';

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

    localStorage.setItem('auth-token', token);
    interceptor.refreshToken();

    const req = httpMock.expectOne('/auth/refresh');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(expireSessionSpy).toHaveBeenCalled();
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

  it('should expire the session when an expired token request returns unauthorized', () => {
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
      .intercept(new HttpRequest('GET', `${location.origin}/api/data`), handler)
      .subscribe({ error: () => undefined });

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

  function createToken(exp: number): string {
    return [
      btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })),
      btoa(JSON.stringify({ exp, user: {} })),
      ''
    ].join('.');
  }
});
