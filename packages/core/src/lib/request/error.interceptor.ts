import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { MessageService } from '../message/shared/message.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private messageService: MessageService) {}

  intercept(
    originalReq: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const interceptError = originalReq.headers.get('interceptError');
    const req = originalReq.clone({
      headers: originalReq.headers.delete('interceptError')
    });
    if (interceptError === 'false') {
      return next.handle(req);
    }
    const errorContainer = { httpError: undefined };
    return next.handle(req).pipe(
      catchError((error) => this.handleError(error, errorContainer)),
      finalize(() => {
        const httpError = errorContainer.httpError;
        if (!httpError) {
          return;
        }

        if (httpError.error.toDisplay) {
          this.handleCaughtError(httpError);
        } else if (!httpError.error.caught) {
          this.handleUncaughtError(httpError);
        }
      })
    );
  }

  private handleError(
    httpError: HttpErrorResponse,
    errorContainer: { httpError: HttpErrorResponse }
  ) {
    if (httpError instanceof HttpErrorResponse) {
      const errorObj = httpError.error === 'object' ? httpError.error : {};
      errorObj.message = httpError.error?.message || httpError.statusText;
      errorObj.caught = false;

      httpError = new HttpErrorResponse({
        error: errorObj,
        headers: httpError.headers,
        status: httpError.status,
        statusText: httpError.statusText,
        url: httpError.url
      });
    }

    errorContainer.httpError = httpError;
    return throwError(httpError);
  }

  private handleCaughtError(httpError: HttpErrorResponse) {
    httpError.error.caught = true;
    this.messageService.error(httpError.error.message, httpError.error.title);
  }

  private handleUncaughtError(httpError: HttpErrorResponse) {
    httpError.error.caught = true;
    this.messageService.error(
      'igo.core.errors.uncaught.message',
      'igo.core.errors.uncaught.title'
    );
  }
}
