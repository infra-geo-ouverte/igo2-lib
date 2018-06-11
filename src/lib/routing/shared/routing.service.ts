import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Message } from '../../core';
import { Routing } from '../shared';

import { RoutingSourceService } from './routing-source.service';
import { RoutingSource } from '../routing-sources/routing-source';


@Injectable()
export class RoutingService {


  constructor(private routingSourceService: RoutingSourceService) {
  }

  route(coordinates: [number, number][]): Observable<Routing[] | Message[]>[] {
    if (coordinates.length === 0) {
      return;
    }

    return this.routingSourceService.sources
      .filter((source: RoutingSource) => source.enabled)
      .map((source: RoutingSource) => this.routeSource(source, coordinates));
  }

  routeSource(
    source: RoutingSource,
    coordinates: [number, number][]): Observable<Routing[] | Message[]> {
    const request = source.route(coordinates);
    return request;
    }
}
