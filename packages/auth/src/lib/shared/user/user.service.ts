import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import { BehaviorSubject, Observable, tap } from 'rxjs';

import { IUser, IUserPreference } from './user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  private baseUrl: string;

  private _user$ = new BehaviorSubject<IUser>(undefined);
  user$ = this._user$.asObservable();

  constructor() {
    this.baseUrl = `${this.config.getConfig('auth.igoApiUrl')}/users`;
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
