import {
  HttpHandler,
  HttpRequest,
  provideHttpClient
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EMPTY } from 'rxjs';

import { provideAuthentification } from './auth.provider';
import { AUTH_OPTIONS, AuthInterceptor } from './shared';

describe('provideAuthentification', () => {
  it('provides disabled authentication options when options are undefined', () => {
    TestBed.configureTestingModule({
      providers: [provideAuthentification(undefined)]
    });

    expect(TestBed.inject(AUTH_OPTIONS)).toEqual({});
  });

  it('forwards requests when authentication is disabled', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideAuthentification(undefined)
      ]
    });
    const handler: HttpHandler = {
      handle: vi.fn(() => EMPTY)
    };

    TestBed.inject(AuthInterceptor)
      .intercept(new HttpRequest('GET', '/api/data'), handler)
      .subscribe();

    expect(handler.handle).toHaveBeenCalledOnce();
  });
});
