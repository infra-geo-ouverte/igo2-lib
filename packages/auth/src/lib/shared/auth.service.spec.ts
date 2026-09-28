import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { provideMockTranslation } from '@igo2/core/language';

import { AUTH_OPTIONS } from './auth.interface';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'auth/login', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockTranslation(),
        {
          provide: AUTH_OPTIONS,
          useValue: {
            url: '/auth',
            tokenKey: 'auth-token',
            loginRoute: 'auth/login'
          }
        },
        AuthService
      ]
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  it('should clear authentication and redirect to login when session expires', inject(
    [AuthService, Router],
    (service: AuthService, router: Router) => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      localStorage.setItem('auth-token', 'token');
      service.authenticate$.next(true);

      service.expireSession('/portal');

      expect(localStorage.getItem('auth-token')).toBeNull();
      expect(service.redirectUrl).toBe('/portal');
      expect(service.authenticate$.value).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['auth/login'], {
        queryParams: {}
      });
    }
  ));
});
