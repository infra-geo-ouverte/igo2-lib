import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Subject } from 'rxjs';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  const route = { queryParams: {} } as ActivatedRouteSnapshot;
  const state = { url: '/portal' } as RouterStateSnapshot;

  let initialized$: Subject<boolean>;
  let redirectToLogin: ReturnType<typeof vi.fn>;
  let guard: AuthGuard;

  beforeEach(() => {
    initialized$ = new Subject<boolean>();
    redirectToLogin = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: {
            initialized$,
            redirectToLogin
          }
        }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should wait for authentication initialization before activating', () => {
    let result: boolean | undefined;

    guard.canActivate(route, state).subscribe((value) => (result = value));

    expect(result).toBeUndefined();

    initialized$.next(true);

    expect(result).toBe(true);
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it('should redirect when authentication initialization fails', () => {
    let result: boolean | undefined;

    guard.canActivate(route, state).subscribe((value) => (result = value));
    initialized$.next(false);

    expect(result).toBe(false);
    expect(redirectToLogin).toHaveBeenCalledWith(route, state);
  });
});
