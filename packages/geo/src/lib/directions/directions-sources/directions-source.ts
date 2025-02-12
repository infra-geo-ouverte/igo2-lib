import { Position } from 'geojson';
import { Observable } from 'rxjs';

import { DirectionOptions, Directions } from '../shared/directions.interface';
import { BaseDirectionsSourceOptionsProfile } from './directions-source.interface';

export abstract class DirectionsSource {
  abstract profiles: BaseDirectionsSourceOptionsProfile[];
  abstract getSourceName(): string;
  abstract getEnabledProfile(): BaseDirectionsSourceOptionsProfile;
  abstract getProfileWithAuthorization(): BaseDirectionsSourceOptionsProfile;
  abstract route(
    coordinates: Position[],
    directionsOptions: DirectionOptions
  ): Observable<Directions[]>;
}
