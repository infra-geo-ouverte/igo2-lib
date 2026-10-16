import { TestBed } from '@angular/core/testing';

import { AUTH_OPTIONS } from './auth.interface';
import { TokenService } from './token.service';

describe('TokenService', () => {
  const tokenKey = 'auth-token';
  const currentTime = new Date('2026-09-24T18:00:00.000Z');
  let service: TokenService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(currentTime);
    TestBed.configureTestingModule({
      providers: [{ provide: AUTH_OPTIONS, useValue: { tokenKey } }]
    });
    service = TestBed.inject(TokenService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('returns missing when no token is stored', () => {
    expect(service.getStatus()).toBe('missing');
    expect(service.isExpired()).toBe(true);
  });

  it('returns expired when the token has no expiration', () => {
    service.set(createToken());

    expect(service.getStatus()).toBe('expired');
    expect(service.isExpired()).toBe(true);
  });

  it('returns expired at the expiration time', () => {
    service.set(createToken(currentTime.getTime() / 1000));

    expect(service.getStatus()).toBe('expired');
  });

  it('returns near-expiry inside the refresh window', () => {
    service.set(createToken(currentTime.getTime() / 1000 + 60));

    expect(service.getStatus()).toBe('near-expiry');
    expect(service.isExpired()).toBe(false);
  });

  it('returns valid outside the refresh window', () => {
    service.set(createToken(currentTime.getTime() / 1000 + 3600));

    expect(service.getStatus()).toBe('valid');
    expect(service.isExpired()).toBe(false);
  });

  it('supports a custom near-expiry window', () => {
    service.set(createToken(currentTime.getTime() / 1000 + 60));

    expect(service.getStatus(30)).toBe('valid');
  });

  function createToken(exp?: number): string {
    return [
      btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })),
      btoa(JSON.stringify({ ...(exp === undefined ? {} : { exp }), user: {} })),
      ''
    ].join('.');
  }
});

describe('TokenService without a token key', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('does not access local storage', () => {
    service.set('token');
    service.remove();

    expect(service.get()).toBeUndefined();
    expect(localStorage.length).toBe(0);
  });
});
