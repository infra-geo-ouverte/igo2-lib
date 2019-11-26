import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService } from '@igo2/core';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  private trustHosts: string[] = [];
  private refreshInProgress = false;

  constructor(
    private config: ConfigService,
    private tokenService: TokenService,
    private http: HttpClient
  ) {
    this.trustHosts = this.config.getConfig('auth.trustHosts') || [];
    this.trustHosts.push(window.location.hostname);
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.refreshToken();
    const token = this.tokenService.get();
    const element = document.createElement('a');
    element.href = req.url;

    if (!token && this.trustHosts.indexOf(element.hostname) === -1) {
      return next.handle(req);
    }

    const authHeader = `Bearer ${token}`;
    const authReq = req.clone({
      headers: req.headers.set('Authorization', authHeader)
    });
    return next.handle(authReq);
  }

  interceptXhr(xhr, url: string) {
    this.refreshToken();
    const element = document.createElement('a');
    element.href = url;

    const token = this.tokenService.get();
    if (!token && this.trustHosts.indexOf(element.hostname) === -1) {
      return;
    }
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  }

  refreshToken() {
    const jwt = this.tokenService.decode();
    const currentTime = new Date().getTime() / 1000;

    if (
      !this.refreshInProgress &&
      jwt &&
      currentTime < jwt.exp &&
      currentTime > jwt.exp - 1800
    ) {
      this.refreshInProgress = true;

      const url = this.config.getConfig('auth.url');
      return this.http.post(`${url}/refresh`, {}).subscribe(
        (data: any) => {
          this.tokenService.set(data.token);
          this.refreshInProgress = false;
        },
        err => {
          err.error.caught = true;
          return err;
        }
      );
    }
  }
}
