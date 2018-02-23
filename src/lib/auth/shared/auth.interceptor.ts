import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler,
  HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { TokenService } from './token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.get();
    if (!token) {
      return next.handle(req);
    }
    const authHeader = `Bearer ${token}`;
    const authReq = req.clone({headers: req.headers.set('Authorization', authHeader)});
    return next.handle(authReq);
  }
}
