import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor,
  HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { finalize } from 'rxjs/operators';

import { ActivityService } from './activity.service';

@Injectable()
export class ActivityInterceptor implements HttpInterceptor {

  constructor(private activityService: ActivityService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const id = this.activityService.register();

    return next.handle(req).pipe(
      finalize(() => {
        this.activityService.unregister(id);
      })
    );
  }
}

export function ActivityInterceptorFactory(activityService: ActivityService) {
  return new ActivityInterceptor(activityService);
}

export function provideActivityInterceptor() {
  return {
    provide: HTTP_INTERCEPTORS,
    useFactory: (ActivityInterceptorFactory),
    deps: [ActivityService],
    multi: true
  };
};
