import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService, LanguageService, MessageService } from '@igo2/core';
import { Base64 } from '@igo2/utils';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { globalCacheBusterNotifier } from 'ts-cacheable';

import { AuthOptions, IInfosUser, User } from './auth.interface';
import { IgoJwtPayload } from './token.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authenticate$ = new BehaviorSubject<boolean>(undefined);
  public logged$ = new BehaviorSubject<boolean>(undefined);
  public redirectUrl: string;
  public languageForce = false;
  private anonymous = false;
  private authOptions: AuthOptions;

  get hasAuthService() {
    return this.authOptions?.url !== undefined;
  }

  get user(): User | null {
    const { user = null } = this.decodeToken();
    return user;
  }

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private config: ConfigService,
    private languageService: LanguageService,
    private messageService: MessageService,
    @Optional() private router: Router
  ) {
    this.authOptions = this.config.getConfig('auth');
    this.authenticate$.next(this.authenticated);
    this.authenticate$.subscribe((authenticated) => {
      this.logged$.next(authenticated);
      globalCacheBusterNotifier.next();
    });
  }

  login(username: string, password: string): Observable<void> {
    const myHeader = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      username,
      password: this.encodePassword(password)
    };

    return this.loginCall(body, myHeader);
  }

  loginWithToken(
    token: string,
    type: string,
    infosUser?: IInfosUser
  ): Observable<void> {
    const myHeader = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      token,
      typeConnection: type,
      infosUser
    };

    return this.loginCall(body, myHeader);
  }

  loginAnonymous(): Observable<boolean> {
    this.anonymous = true;
    this.logged$.next(true);
    return of(true);
  }

  refresh(): Observable<void> {
    return this.http.post(`${this.authOptions?.url}/refresh`, {}).pipe(
      tap((data: any) => {
        this.tokenService.set(data.token);
      }),
      catchError((err) => {
        err.error.caught = true;
        throw err;
      })
    );
  }

  logout(): Observable<boolean> {
    this.anonymous = false;
    this.tokenService.remove();
    this.authenticate$.next(false);
    return of(true);
  }

  isAuthenticated(): boolean {
    return !this.tokenService.isExpired();
  }

  getToken(): string {
    return this.tokenService.get();
  }

  decodeToken(): IgoJwtPayload | null {
    if (this.isAuthenticated()) {
      return this.tokenService.decode();
    }
    return;
  }

  goToRedirectUrl() {
    if (!this.router) {
      return;
    }
    const redirectUrl = this.redirectUrl || this.router.url;

    if (redirectUrl === this.authOptions.loginRoute) {
      const homeRoute = this.authOptions.homeRoute || '/';
      this.router.navigateByUrl(homeRoute);
    } else if (redirectUrl) {
      this.router.navigateByUrl(redirectUrl);
    }
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

  private loginCall(body, headers) {
    return this.http
      .post(`${this.authOptions?.url}/login`, body, { headers })
      .pipe(
        tap((data: any) => {
          this.tokenService.set(data.token);
          const tokenDecoded = this.decodeToken();
          if (tokenDecoded?.user) {
            if (tokenDecoded.user.locale && !this.languageForce) {
              this.languageService.setLanguage(tokenDecoded.user.locale);
            }
            if (tokenDecoded.user.isExpired) {
              this.messageService.alert('igo.auth.error.Password expired');
            }
          }
          this.authenticate$.next(true);
        }),
        catchError((err) => {
          err.error.caught = true;
          throw err;
        })
      );
  }
}
