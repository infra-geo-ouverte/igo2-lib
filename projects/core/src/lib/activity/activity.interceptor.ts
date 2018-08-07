import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ActivityService } from './activity.service';

@Injectable()
export class ActivityInterceptor implements HttpInterceptor {
  constructor(private activityService: ActivityService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const activity = req.headers.get('activityInterceptor');
    if (activity) {
      const actReq = req.clone({
        headers: req.headers.delete('activityInterceptor')
      });
      if (activity === 'false') {
        return next.handle(actReq);
      }
    }

    const id = this.activityService.register();

    return next.handle(req).pipe(
      finalize(() => {
        this.activityService.unregister(id);
      })
    );
  }
}
