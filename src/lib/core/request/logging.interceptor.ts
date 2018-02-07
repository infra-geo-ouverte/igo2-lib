import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HTTP_INTERCEPTORS,
  HttpRequest, HttpResponse } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const started = Date.now();
    let ok: string;

    // extend server response observable with logging
    return next.handle(req)
      .pipe(
        tap(
          // Succeeds when there is a response; ignore other events
          event => ok = event instanceof HttpResponse ? 'succeeded' : '',
          // Operation failed; error is an HttpErrorResponse
          error => ok = 'failed'
        ),
        // Log when response observable either completes or errors
        finalize(() => {
          const elapsed = Date.now() - started;
          const msg = `${req.method} "${req.urlWithParams}"
             ${ok} in ${elapsed} ms.`;

          console.log(msg);
        })
      );
  }
}

export function LoggingInterceptorFactory() {
  return new LoggingInterceptor();
}

export function provideLoggingInterceptor() {
  return {
    provide: HTTP_INTERCEPTORS,
    useFactory: (LoggingInterceptorFactory),
    multi: true
  };
};
