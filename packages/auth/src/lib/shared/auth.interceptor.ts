import { Injectable } from '@angular/core';
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

  constructor(
    private config: ConfigService,
    private tokenService: TokenService
  ) {
    this.trustHosts = this.config.getConfig('auth.trustHosts') || [];
    this.trustHosts.push(window.location.hostname);
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
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
}
