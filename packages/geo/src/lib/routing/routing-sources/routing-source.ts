import { Observable } from 'rxjs';

import { Message } from '@igo2/core';

import { Routing, RoutingOptions } from '../shared/routing.interface';

export abstract class RoutingSource {
  abstract enabled: boolean;
  abstract getName(): string;
  abstract route(coordinates: [number, number][], routingOptions: RoutingOptions): Observable<Routing[]>;
}
