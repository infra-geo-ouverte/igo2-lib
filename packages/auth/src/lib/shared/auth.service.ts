import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { RouteService } from '@igo2/core/route';
import { Base64 } from '@igo2/utils';

import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  of,
  throwError
} from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { globalCacheBusterNotifier } from 'ts-cacheable';

import { AUTH_OPTIONS, AuthOptions, IInfosUser, User } from './auth.interface';
import { TokenService } from './token.service';
import { IUser } from './user/user.interface';
import { UserService } from './user/user.service';

interface IToken {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService<T extends AuthOptions = AuthOptions> {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private userService = inject(UserService, {
    optional: true
  });
  private languageService = inject(LanguageService, { optional: true });
  private messageService = inject(MessageService);
  private router = inject(Router);
  private routeService = inject(RouteService);

  public authenticate$ = new BehaviorSubject<boolean>(false);
  public logged$ = new BehaviorSubject<boolean>(false);
  public readonly initialized$ = new ReplaySubject<boolean>(1);
  public redirectUrl?: string;
  public languageForce = false;
  public authOptions: T;

  private anonymous = false;

  isLogging = signal(false);

  constructor() {
    this.authOptions = inject(AUTH_OPTIONS) as T;

    this.initializeAuthentication(this.authenticated).subscribe();

    this.authenticate$.subscribe((authenticated) => {
      this.logged$.next(authenticated);
      globalCacheBusterNotifier.next();
    });
  }

  get hasAuthService(): boolean {
    return Boolean(this.authOptions.url);
  }

  get user(): User | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    const decodedToken = this.tokenService.decode();
    return decodedToken?.user ? decodedToken.user : null;
  }

  get logged(): boolean {
    return this.authenticated || this.isAnonymous;
  }

  get isAnonymous(): boolean {
    return this.anonymous;
  }

  get authenticated(): boolean {
    return this.isAuthenticated();
  }

  get isAdmin(): boolean {
    return this.user?.isAdmin ?? false;
  }

  login(username: string, password: string): Observable<IUser | null> {
    this.isLogging.set(true);
    const myHeader = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      username,
      password: this.encodePassword(password)
    };

    return this.loginCall(body, myHeader).pipe(
      finalize(() => this.isLogging.set(false))
    );
  }

  loginWithToken(
    token: string,
    type: string,
    infosUser?: IInfosUser,
    applicationId?: string
  ): Observable<IUser | null> {
    const myHeader = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      token,
      typeConnection: type,
      infosUser,
      applicationId
    };

    return this.loginCall(body, myHeader);
  }

  loginAnonymous(): Observable<boolean> {
    this.anonymous = true;
    this.logged$.next(true);
    return of(true);
  }

  refresh(): Observable<IToken> {
    const url = this.getAuthenticationUrl('refresh');
    if (!url) {
      return this.authenticationNotConfigured();
    }

    return this.http.post<IToken>(url, {}).pipe(
      tap((data) => {
        this.tokenService.set(data.token);
      }),
      catchError((err) => {
        if (err.error && typeof err.error === 'object') {
          err.error.caught = true;
        }
        this.expireSession();
        throw err;
      })
    );
  }

  logout(): void {
    this.logoutInternal();
    if (this.authOptions?.logoutRedirectRoute) {
      this.router?.navigate([this.authOptions.logoutRedirectRoute]);
    }
  }

  expireSession(redirectUrl: string = this.router.url): void {
    this.redirectUrl = redirectUrl;
    this.logoutInternal();
    this.navigateToLogin();
  }

  isAuthenticated(): boolean {
    return !this.tokenService.isExpired();
  }

  goToRedirectUrl() {
    if (!this.router) {
      return;
    }
    const redirectUrl = this.redirectUrl ?? this.authOptions?.homeRoute ?? '/';

    this.router.navigateByUrl(redirectUrl);
  }

  getUserInfo(): Observable<User> {
    const url = this.getAuthenticationUrl('info');
    if (!url) {
      return this.authenticationNotConfigured();
    }

    return this.http.get<User>(url);
  }

  getProfils(): Observable<{ profils: string[] }> {
    const url = this.getAuthenticationUrl('profils');
    if (!url) {
      return this.authenticationNotConfigured();
    }

    return this.http.get<{ profils: string[] }>(url);
  }

  updateUser(user: User): Observable<User> {
    const url = this.getAuthenticationUrl();
    if (!url) {
      return this.authenticationNotConfigured();
    }

    return this.http.patch<User>(url, user);
  }

  redirectToLogin(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): void {
    this.redirectUrl = state.url;
    const langKey = this.routeService.options.languageKey ?? 'lang';
    const langValue = route.queryParams[langKey];

    this.navigateToLogin(langValue ? { [langKey]: langValue } : {});
  }

  protected loginCall(body: unknown, headers: HttpHeaders) {
    const url = this.getAuthenticationUrl('login');
    if (!url) {
      return this.authenticationNotConfigured<IUser | null>();
    }

    return this.http.post<IToken>(url, body, { headers }).pipe(
      tap((data) => {
        this.tokenService.set(data.token);
        const user = this.user;
        if (!user) {
          return;
        }

        if (user.locale && !this.languageForce) {
          this.languageService?.setLanguage(user.locale);
        }

        if (user.isExpired) {
          this.messageService.alert('igo.auth.error.intern.Password expired');
        }
      }),
      switchMap(() => this.initializeAuthentication(true))
    );
  }

  private getAuthenticationUrl(path?: string): string | undefined {
    const url = this.authOptions.url;
    if (!url) {
      return;
    }

    return path ? `${url}/${path}` : url;
  }

  private authenticationNotConfigured<T>(): Observable<T> {
    return throwError(() => new Error('Authentication is not configured.'));
  }

  private logoutInternal(): void {
    this.anonymous = false;
    this.tokenService.remove();
    this.authenticate$.next(false);
    this.initialized$.next(false);
  }

  private navigateToLogin(queryParams: Record<string, string> = {}): void {
    if (!this.authOptions?.loginRoute) {
      return;
    }

    this.router.navigate([this.authOptions.loginRoute], { queryParams });
  }

  private encodePassword(password: string) {
    return Base64.encode(password);
  }

  private initializeAuthentication(
    isAuthenticated: boolean
  ): Observable<IUser | null> {
    if (!isAuthenticated) {
      this.authenticate$.next(false);
      this.initialized$.next(false);
      return of(null);
    }

    if (this.userService) {
      const obs$ = this.authOptions?.user?.withSync
        ? this.userService.sync()
        : this.userService.getUser();

      return obs$.pipe(
        tap(() => {
          this.authenticate$.next(true);
          this.initialized$.next(true);
        }),
        catchError(() => {
          this.authenticate$.next(false);
          this.initialized$.next(false);
          return of(null);
        })
      );
    }

    this.authenticate$.next(true);
    this.initialized$.next(true);
    return of(null);
  }
}
