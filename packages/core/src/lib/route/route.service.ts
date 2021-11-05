import { Injectable, Inject, InjectionToken, Optional } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
    private router: Router,
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
      directionsCoordKey: 'routing',
      directionsOptionsKey: 'routingOptions',
      toolKey: 'tool',
      wmsUrlKey: 'wmsUrl',
      wmsLayersKey:  'wmsLayers',
      wmtsUrlKey: 'wmtsUrl',
      wmtsLayersKey:  'wmtsLayers',
      arcgisUrlKey: 'arcgisUrl',
      arcgisLayersKey:  'arcgisLayers',
      iarcgisUrlKey: 'iarcgisUrl',
      iarcgisLayersKey:  'iarcgisLayers',
      tarcgisUrlKey: 'tarcgisUrl',
      tarcgisLayersKey:  'tarcgisLayers',
      vectorKey: 'vector'
    };
    this.options = Object.assign({}, defaultOptions, options);
  }

  get queryParams(): Observable<Params> {
    const queryParams: any = location.search
      .slice(1)
      .split('&')
      .map(p => p.split('='))
      .reduce((obj, pair) => {
        const [key, value] = pair.map(decodeURIComponent);
        obj[key] = value;
        return obj;
      }, {});

    let center;
    if (queryParams && Object.keys(queryParams).length) {
      Object.keys(queryParams).map(key => {
        if (queryParams[key]?.includes('¢er=')) {
          const error = queryParams[key].split('¢er=');
          queryParams[key] = error[0];
          center = error[1];
        }
      });
    }
    if (center) {
      queryParams.center = center;
      this.router.navigate([], { queryParams });
    }
    return this.route.queryParams;
  }
}
