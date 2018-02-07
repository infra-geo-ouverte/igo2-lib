import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler,
  HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { TokenService } from './token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authHeader = `Bearer ${this.tokenService.get()}`;
    const authReq = req.clone({headers: req.headers.set('Authorization', authHeader)});
    return next.handle(authReq);
  }
}

export function AuthInterceptorFactory(tokenService: TokenService) {
  return new AuthInterceptor(tokenService);
}

export function provideAuthInterceptor() {
  return {
    provide: HTTP_INTERCEPTORS,
    useFactory: (AuthInterceptorFactory),
    deps: [TokenService],
    multi: true
  };
};
