import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';

import { BehaviorSubject, Observable, tap } from 'rxjs';

import { IAuthUserIgoOptions } from '../auth.interface';
import { IUser, IUserPreference } from './user.interface';

export const USER_AUTH_OPTIONS = new InjectionToken<IAuthUserIgoOptions>(
  'USER_AUTH_OPTIONS'
);

@Injectable()
export class UserService {
  private http = inject(HttpClient);
  private options = inject(USER_AUTH_OPTIONS);

  private baseUrl: string;

  private _user$ = new BehaviorSubject<IUser | undefined>(undefined);
  user$ = this._user$.asObservable();

  constructor() {
    this.baseUrl = this.options.apiUrl;
  }

  getUser(): Observable<IUser> {
    return this.http
      .get<IUser>(this.baseUrl)
      .pipe(tap((user) => this._user$.next(user)));
  }

  sync(): Observable<IUser> {
    return this.http
      .get<IUser>(`${this.baseUrl}/sync`)
      .pipe(tap((user) => this._user$.next(user)));
  }

  updatePreference(preference: IUserPreference) {
    return this.http.patch<{ id: number }>(this.baseUrl, { preference });
  }
}
