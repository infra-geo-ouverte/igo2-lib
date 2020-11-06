import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Md5 } from 'ts-md5';

import { ConfigService } from '@igo2/core';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  private refreshInProgress = false;

  private get trustHosts() {
    const trustHosts = this.config.getConfig('auth.trustHosts') || [];
    trustHosts.push(window.location.hostname);
    return trustHosts;
  }

  constructor(
    private config: ConfigService,
    private tokenService: TokenService,
    private http: HttpClient
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.refreshToken();
    const token = this.tokenService.get();
    const element = document.createElement('a');
    element.href = req.url;
    if (element.host === '') {
      element.href = element.href; // FIX IE11, DO NOT REMOVE
    }

    if (!token || this.trustHosts.indexOf(element.hostname) === -1) {
      return next.handle(req);
    }

    const authHeader = `Bearer ${token}`;
    let authReq = req.clone({
      headers: req.headers.set('Authorization', authHeader)
    });

    const tokenDecoded: any = this.tokenService.decode();
    if (
      authReq.params.get('_i') === 'true' &&
      tokenDecoded &&
      tokenDecoded.user &&
      tokenDecoded.user.sourceId
    ) {
      const hashUser = Md5.hashStr(tokenDecoded.user.sourceId) as string;
      authReq = authReq.clone({
        params: authReq.params.set('_i', hashUser)
      });
    } else if (authReq.params.get('_i') === 'true') {
      authReq = authReq.clone({
        params: authReq.params.delete('_i')
      });
    }

    return next.handle(authReq);
  }

  interceptXhr(xhr, url: string): boolean {
    this.refreshToken();
    const element = document.createElement('a');
    element.href = url;

    const token = this.tokenService.get();
    if (!token || this.trustHosts.indexOf(element.hostname) === -1) {
      return false;
    }
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    return true;
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
