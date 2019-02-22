import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Message } from '@igo2/core';

import { Routing } from '../shared/routing.interface';
import { RoutingSource } from '../routing-sources/routing-source';
import { RoutingSourceService } from './routing-source.service';

@Injectable({
  providedIn: 'root'
})
export class RoutingService {
  constructor(private routingSourceService: RoutingSourceService) {}

  route(coordinates: [number, number][]): Observable<Routing[]>[] {
    if (coordinates.length === 0) {
      return;
    }
    return this.routingSourceService.sources
      .filter((source: RoutingSource) => source.enabled)
      .map((source: RoutingSource) => this.routeSource(source, coordinates));
  }

  routeSource(
    source: RoutingSource,
    coordinates: [number, number][]
  ): Observable<Routing[]> {
    const request = source.route(coordinates);
    return request;
  }
}
