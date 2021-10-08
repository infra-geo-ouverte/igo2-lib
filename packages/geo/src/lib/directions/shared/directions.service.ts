import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


import { Directions, DirectionsOptions } from '../shared/directions.interface';
import { DirectionsSource } from '../directions-sources/directions-source';
import { DirectionsSourceService } from './directions-source.service';

@Injectable({
  providedIn: 'root'
})
export class DirectionsService {
  constructor(private directionsSourceService: DirectionsSourceService) {}

  route(coordinates: [number, number][], directionsOptions: DirectionsOptions = {}): Observable<Directions[]>[] {
    if (coordinates.length === 0) {
      return;
    }
    return this.directionsSourceService.sources
      .filter((source: DirectionsSource) => source.enabled)
      .map((source: DirectionsSource) => this.routeSource(source, coordinates, directionsOptions));
  }

  routeSource(
    source: DirectionsSource,
    coordinates: [number, number][],
    directionsOptions: DirectionsOptions = {}
  ): Observable<Directions[]> {
    const request = source.route(coordinates, directionsOptions );
    return request;
  }
}
