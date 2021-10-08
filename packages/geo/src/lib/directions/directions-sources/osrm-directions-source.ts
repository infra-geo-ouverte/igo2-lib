import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { uuid } from '@igo2/utils';
import { ConfigService, Message } from '@igo2/core';

import { Directions, DirectionsOptions } from '../shared/directions.interface';
import { DirectionsFormat, SourceDirectionsType } from '../shared/directions.enum';

import { DirectionsSource } from './directions-source';
import { DirectionsSourceOptions } from './directions-source.interface';

@Injectable()
export class OsrmDirectionsSource extends DirectionsSource {
  get enabled(): boolean {
    return this.options.enabled !== false;
  }
  set enabled(value: boolean) {
    this.options.enabled = value;
  }
  static _name = 'OSRM Québec';
  private directionsUrl =
    'https://geoegl.msp.gouv.qc.ca/services/itineraire/route/v1/driving/';
  private options: DirectionsSourceOptions;

  constructor(private http: HttpClient, private config: ConfigService) {
    super();
    this.options = this.config.getConfig('directionsSources.osrm') || {};
    this.directionsUrl = this.options.url || this.directionsUrl;
  }

  getName(): string {
    return OsrmDirectionsSource._name;
  }

  route(coordinates: [number, number][], directionsOptions: DirectionsOptions = {}): Observable<Directions[]> {
    const directionsParams = this.getRouteParams(directionsOptions);
    return this.http
      .get<JSON[]>(this.directionsUrl + coordinates.join(';'), {
        params: directionsParams
      })
      .pipe(map(res => this.extractRoutesData(res)));
  }

  private extractRoutesData(response): Directions[] {
    const routeResponse = [];
    response.routes.forEach(route => {
      routeResponse.push(this.formatRoute(route, response.waypoints));
    });
    return routeResponse;
  }

  private getRouteParams(directionsOptions: DirectionsOptions = {}): HttpParams {

    directionsOptions.alternatives = directionsOptions.alternatives !== undefined ? directionsOptions.alternatives : true;
    directionsOptions.steps = directionsOptions.steps !== undefined ? directionsOptions.steps : true;
    directionsOptions.geometries = directionsOptions.geometries !== undefined ? directionsOptions.geometries : 'geojson';
    directionsOptions.overview = directionsOptions.overview !== undefined ? directionsOptions.overview : false;

    return new HttpParams({
      fromObject: {
        alternatives: directionsOptions.alternatives ? 'true' : 'false',
        overview: directionsOptions.overview ? 'simplified' : 'full',
        steps: directionsOptions.steps ? 'true' : 'false',
        geometries: directionsOptions.geometries ? directionsOptions.geometries : 'geojson',
      }
    });
  }

  private formatRoute(roadNetworkRoute: any, waypoints: any): Directions {
    const stepsUI = [];
    roadNetworkRoute.legs.forEach(leg => {
      leg.steps.forEach(step => {
        stepsUI.push(step);
      });
    });
    return {
      id: uuid(),
      title: roadNetworkRoute.legs[0].summary,
      source: OsrmDirectionsSource._name,
      sourceType: SourceDirectionsType.Route,
      order: 1,
      format: DirectionsFormat.GeoJSON,
      icon: 'directions',
      projection: 'EPSG:4326',
      waypoints,
      distance: roadNetworkRoute.distance,
      duration: roadNetworkRoute.duration,
      geometry: roadNetworkRoute.geometry,
      legs: roadNetworkRoute.legs,
      steps: stepsUI,
      weight: roadNetworkRoute.weight,
      weight_name: roadNetworkRoute.weight_name
    };
  }
}
