import { Injectable, Inject, InjectionToken, Optional } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';

import { RouteServiceOptions } from './route.interface';

export let ROUTE_SERVICE_OPTIONS = new InjectionToken<RouteServiceOptions>(
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

  constructor(
    public route: ActivatedRoute,
    @Inject(ROUTE_SERVICE_OPTIONS)
    @Optional()
    options: RouteServiceOptions
  ) {
    const defaultOptions = {
      centerKey: 'center',
      zoomKey: 'zoom',
      projectionKey: 'projection',
      contextKey: 'context',
      searchKey: 'search',
      visibleOnLayersKey: 'visiblelayers',
      visibleOffLayersKey: 'invisiblelayers',
      routingCoordKey: 'routing',
      toolKey: 'tool'
    };
    this.options = Object.assign({}, defaultOptions, options);
  }

  get queryParams(): Observable<Params> {
    return this.route.queryParams;
  }
}
