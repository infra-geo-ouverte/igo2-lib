import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { firstValueFrom, of } from 'rxjs';

import { AUTH_OPTIONS, AuthOptions } from './auth.interface';
import { AuthService } from './auth.service';
import { ProfilsGuard } from './profils.guard';

describe('ProfilsGuard', () => {
  const route = { queryParams: {} } as ActivatedRouteSnapshot;
  const state = { url: '/admin' } as RouterStateSnapshot;

  it('denies access without authentication configuration', async () => {
    const authService = configureGuard({});

    await expect(
      firstValueFrom(TestBed.inject(ProfilsGuard).canActivate(route, state))
    ).resolves.toBe(false);
    expect(authService.getProfils).not.toHaveBeenCalled();
    expect(authService.redirectToLogin).toHaveBeenCalledWith(route, state);
  });

  it('allows access when the user has an accepted profile', async () => {
    const authService = configureGuard(
      { url: '/auth', profilsGuard: ['admin'] },
      ['admin']
    );

    await expect(
      firstValueFrom(TestBed.inject(ProfilsGuard).canActivate(route, state))
    ).resolves.toBe(true);
    expect(authService.redirectToLogin).not.toHaveBeenCalled();
  });

  it('denies access when the user has no accepted profile', async () => {
    const authService = configureGuard(
      { url: '/auth', profilsGuard: ['admin'] },
      ['viewer']
    );

    await expect(
      firstValueFrom(TestBed.inject(ProfilsGuard).canActivate(route, state))
    ).resolves.toBe(false);
    expect(authService.redirectToLogin).toHaveBeenCalledWith(route, state);
  });

  function configureGuard(options: AuthOptions, profils: string[] = []) {
    const authService = {
      hasAuthService: Boolean(options.url),
      getProfils: vi.fn(() => of({ profils })),
      redirectToLogin: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ProfilsGuard,
        { provide: AUTH_OPTIONS, useValue: options },
        { provide: AuthService, useValue: authService }
      ]
    });

    return authService;
  }
});
