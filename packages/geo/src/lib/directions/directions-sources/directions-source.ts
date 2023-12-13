import { Observable } from 'rxjs';

import { Route, RouteOptions } from '../shared/directions.interface';
import { Position } from 'geojson';

export abstract class DirectionsSource {
  abstract enabled: boolean;
  abstract getName(): string;
  abstract route(
    coordinates: Position[],
    routeOptions: RouteOptions
  ): Observable<Route[]>;
}
