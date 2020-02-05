import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Message } from '@igo2/core';

import { Routing, RoutingOptions } from '../shared/routing.interface';
import { RoutingSource } from '../routing-sources/routing-source';
import { RoutingSourceService } from './routing-source.service';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  constructor(private routingSourceService: RoutingSourceService) {}

  route(coordinates: [number, number][], routingOptions: RoutingOptions = {}): Observable<Routing[]>[] {
    if (coordinates.length === 0) {
      return;
    }
    return this.routingSourceService.sources
      .filter((source: RoutingSource) => source.enabled)
      .map((source: RoutingSource) => this.routeSource(source, coordinates, routingOptions));
  }

  routeSource(
    source: RoutingSource,
    coordinates: [number, number][],
    routingOptions: RoutingOptions = {}
  ): Observable<Routing[]> {
    const request = source.route(coordinates, routingOptions );
    return request;
  }
}
