import { Observable } from 'rxjs';


import { Directions, DirectionsOptions } from '../shared/directions.interface';

export abstract class DirectionsSource {
  abstract enabled: boolean;
  abstract getName(): string;
  abstract route(coordinates: [number, number][], directionsOptions: DirectionsOptions): Observable<Directions[]>;
}
