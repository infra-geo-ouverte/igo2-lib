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

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { globalCacheBusterNotifier } from 'ts-cacheable';

import { AUTH_OPTIONS, AuthOptions, IInfosUser, User } from './auth.interface';
import { IgoJwtPayload } from './token.interface';
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
  public redirectUrl?: string;
  public languageForce = false;
  public authOptions: T;

  private anonymous = false;

  isLogging = signal(false);

  get hasAuthService() {
    return this.authOptions?.url !== undefined;
  }

  get user(): User | null {
    const decodedToken = this.decodeToken();
    return decodedToken?.user ? decodedToken.user : null;
  }

  constructor() {
    this.authOptions = inject(AUTH_OPTIONS) as T;

    this.initializeAuthentication(this.authenticated).subscribe();

    this.authenticate$.subscribe((authenticated) => {
      this.logged$.next(authenticated);
      globalCacheBusterNotifier.next();
    });
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
    return this.http.post<IToken>(`${this.authOptions?.url}/refresh`, {}).pipe(
      tap((data) => {
        this.tokenService.set(data.token);
      }),
      catchError((err) => {
        err.error.caught = true;
        throw err;
      })
    );
  }

  logout(): void {
    this.logoutInternal();
    if (this.authOptions.logoutRedirectRoute) {
      this.router?.navigate([this.authOptions.logoutRedirectRoute]);
    }
  }

  private logoutInternal(): void {
    this.anonymous = false;
    this.tokenService.remove();
    this.authenticate$.next(false);
  }

  isAuthenticated(): boolean {
    return !this.tokenService.isExpired();
  }

  getToken(): string | undefined {
    return this.tokenService.get();
  }

  decodeToken(): IgoJwtPayload | undefined {
    if (this.isAuthenticated()) {
      return this.tokenService.decode();
    }
    return;
  }

  goToRedirectUrl() {
    if (!this.router) {
      return;
    }
    const redirectUrl = this.redirectUrl ?? this.authOptions.homeRoute ?? '/';

    this.router.navigateByUrl(redirectUrl);
  }

  getUserInfo(): Observable<User> {
    const url = this.authOptions?.url + '/info';
    return this.http.get<User>(url);
  }

  getProfils(): Observable<{ profils: string[] }> {
    return this.http.get<{ profils: string[] }>(
      `${this.authOptions?.url}/profils`
    );
  }

  updateUser(user: User): Observable<User> {
    return this.http.patch<User>(this.authOptions?.url, user);
  }

  private encodePassword(password: string) {
    return Base64.encode(password);
  }

  // authenticated or anonymous
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
    const token = this.decodeToken();
    if (token?.user?.isAdmin) {
      return true;
    }
    return false;
  }

  redirectToLogin(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): void {
    this.redirectUrl = state.url;

    if (this.authOptions?.loginRoute) {
      const langKey = this.routeService.options.languageKey ?? 'lang';
      const langValue = route.queryParams[langKey];
      this.router.navigate([this.authOptions.loginRoute], {
        queryParams: langValue ? { [langKey]: langValue } : {}
      });
    }
  }

  protected loginCall(body: unknown, headers: HttpHeaders) {
    return this.http
      .post<IToken>(`${this.authOptions?.url}/login`, body, { headers })
      .pipe(
        tap((data) => {
          this.tokenService.set(data.token);
          const tokenDecoded = this.decodeToken();
          if (tokenDecoded?.user) {
            if (tokenDecoded.user.locale && !this.languageForce) {
              this.languageService?.setLanguage(tokenDecoded.user.locale);
            }
            if (tokenDecoded.user.isExpired) {
              this.messageService.alert(
                'igo.auth.error.intern.Password expired'
              );
            }
          }
        }),
        switchMap(() => this.initializeAuthentication(true))
      );
  }

  private initializeAuthentication(
    isAuthenticated: boolean
  ): Observable<IUser | null> {
    if (!isAuthenticated) {
      this.authenticate$.next(false);
      return of(null);
    }

    if (this.userService) {
      const obs$ = this.authOptions.user?.withSync
        ? this.userService.sync()
        : this.userService.getUser();

      return obs$.pipe(tap(() => this.authenticate$.next(true)));
    }

    this.authenticate$.next(true);
    return of(null);
  }
}
