import { Injectable, Inject, InjectionToken, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RouteServiceOptions } from '.';

export let ROUTE_SERVICE_OPTIONS =
  new InjectionToken<RouteServiceOptions>('routeServiceOptions');

export function provideRouteServiceOptions(options: RouteServiceOptions) {
  return {
    provide: ROUTE_SERVICE_OPTIONS,
    useValue: options
  };
}

@Injectable()
export class RouteService {
  public options: RouteServiceOptions;

  constructor(public route: ActivatedRoute,
              @Inject(ROUTE_SERVICE_OPTIONS)
              @Optional() options: RouteServiceOptions) {

    const defaultOptions = {
      centerKey: 'center',
      zoomKey: 'zoom',
      projectionKey: 'projection',
      contextKey: 'context',
      searchKey: 'search'
    };
    this.options = Object.assign({}, defaultOptions, options);
  }

  get queryParams() {
    return this.route.queryParams;
  }

}
