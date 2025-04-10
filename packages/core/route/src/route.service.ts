import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Observable } from 'rxjs';

import {
  LEGACY_ROUTE_OPTIONS,
  ROUTE_OPTIONS,
  RouteServiceOptions
} from './route.interface';

export const ROUTE_SERVICE_OPTIONS = new InjectionToken<RouteServiceOptions>(
  'routeServiceOptions'
);

export function provideRouteServiceOptions(options: RouteServiceOptions) {
  return {
    provide: ROUTE_SERVICE_OPTIONS,
    useValue: options
  };
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  public options: RouteServiceOptions;

  /**
   * @deprecated use the new option of context-service
   */
  public legacyOptions: RouteServiceOptions;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    @Inject(ROUTE_SERVICE_OPTIONS)
    @Optional()
    configs: RouteServiceOptions
  ) {
    this.options = { ...ROUTE_OPTIONS, ...configs };
    this.legacyOptions = LEGACY_ROUTE_OPTIONS;
  }

  get queryParams(): Observable<Params> {
    let url = decodeURIComponent(location.search);
    if (url.includes('¢er=')) {
      url = url.replace('¢er', '&center');
      const queryParams: any = url
        .slice(1)
        .split('&')
        .map((p) => p.split('='))
        .reduce((obj, pair) => {
          const [key, value] = pair.map(decodeURIComponent);
          obj[key] = value;
          return obj;
        }, {});
      this.router.navigate([], { queryParams });
    }
    return this.route.queryParams;
  }
}
