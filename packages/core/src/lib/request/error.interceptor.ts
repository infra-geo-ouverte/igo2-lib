import { Injectable, Injector } from '@angular/core';
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
import { LanguageService } from '../language/shared/language.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private messageService: MessageService,
    private injector: Injector
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const errorContainer = { httpError: undefined };
    return next.handle(req).pipe(
      catchError(error => this.handleError(error, errorContainer)),
      finalize(() => {
        this.handleCaughtError(errorContainer);
        this.handleUncaughtError(errorContainer);
      })
    );
  }

  private handleError(
    httpError: HttpErrorResponse,
    errorContainer: { httpError: HttpErrorResponse }
  ) {
    if (httpError instanceof HttpErrorResponse) {
      const errorObj = httpError.error === 'object' ? httpError.error : {};
      errorObj.message = httpError.error.message || httpError.statusText;
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

  private handleCaughtError(errorContainer: { httpError: HttpErrorResponse }) {
    const httpError = errorContainer.httpError;
    if (httpError && httpError.error.toDisplay) {
      httpError.error.caught = true;
      this.messageService.error(httpError.error.message, httpError.error.title);
    }
  }

  private handleUncaughtError(errorContainer: {
    httpError: HttpErrorResponse;
  }) {
    const httpError = errorContainer.httpError;
    if (httpError && !httpError.error.caught) {
      const translate = this.injector.get(LanguageService).translate;
      const message = translate.instant('igo.core.errors.uncaught.message');
      const title = translate.instant('igo.core.errors.uncaught.title');
      httpError.error.caught = true;
      this.messageService.error(message, title);
    }
  }
}
