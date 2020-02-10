import { Observable } from 'rxjs';

import { Message } from '@igo2/core';

import { Directions, DirectionsOptions } from '../shared/directions.interface';

export abstract class DirectionsSource {
  abstract enabled: boolean;
  abstract getName(): string;
  abstract route(coordinates: [number, number][], directionsOptions: DirectionsOptions): Observable<Directions[]>;
}
