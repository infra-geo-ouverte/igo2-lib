import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent,
  HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => this.handleError(error, req))
    );
  }

  private handleError(error: HttpErrorResponse, req: HttpRequest<any>) {
    const msg = `${req.method} ${req.urlWithParams} ${error.status} (${error.statusText})`;

    if (error instanceof HttpErrorResponse) {
      console.error(msg, '\n', error.error.message, '\n\n', error);
      error.error.message = error.error.message || 'Error server';
    }

    return new ErrorObservable(error);
  };
}
