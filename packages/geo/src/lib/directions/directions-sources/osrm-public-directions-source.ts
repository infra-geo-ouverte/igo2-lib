import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core';
import { customCacheHasher, uuid } from '@igo2/utils';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';

import {
  DirectionsFormat,
  SourceDirectionsType
} from '../shared/directions.enum';
import { Direction, DirectionOptions } from '../shared/directions.interface';
import { DirectionsSource } from './directions-source';
import { DirectionsSourceOptions, OsrmDirectionsSourceOptions } from './directions-source.interface';
import { Position } from 'geojson';

@Injectable()
export class OsrmPublicDirectionsSource extends DirectionsSource {
  get options(): OsrmDirectionsSourceOptions {
    return this._options;
  }

  set options(value: OsrmDirectionsSourceOptions) {
    this._options = value;
  }

  get enabled(): boolean {
    return this._options.enabled;
  }

  set enabled(value: boolean) {
    this._options.enabled = value;
  }

  get name(): string {
    return this._options.name;
  }

  set name(value: string) {
    this._options.name = value;
  }

  get url(): string {
    return this._options.url;
  }

  set url(value: string) {
    this._options.url = value;
  }

  get userVerifUrl(): string {
    return this._options.userVerifUrl;
  }

  set userVerifUrl(value: string) {
    this._options.userVerifUrl = value;
  }

  get type(): 'public' | 'private' {
    return this._options.type;
  }

  set type(value: 'public' | 'private') {
    this._options.type = value;
  }

  private _options: OsrmDirectionsSourceOptions;

  constructor(
    private _http: HttpClient,
    private _config: ConfigService
  ) {
    super();
    const directionsSources: DirectionsSourceOptions[] = this._config.getConfig('directionsSources');
    this.options = directionsSources?.find(dS => dS.osrm.type === 'public')?.osrm || {};
    this.name = this.name ? this.name : 'OSRM Québec (Public)';
    this.url = this.url ? this.url : '/apis/itineraire/route/v1/driving/';
    this.userVerifUrl = undefined;
    this.type = this.type ? this.type : 'public';
    this.enabled = true;
  }

  getName(): string {
    return this.name;
  }

  route(
    coordinates: Position[],
    directionsOptions: DirectionOptions = {}
  ): Observable<Direction[]> {
    const directionsParams = this.getRouteParams(directionsOptions);
    return this.getRoute(coordinates, directionsParams);
  }

  @Cacheable({
    maxCacheCount: 20,
    cacheHasher: customCacheHasher
  })
  private getRoute(
    coordinates: Position[],
    params: HttpParams
  ): Observable<Direction[]> {
    return this._http
      .get<JSON[]>(this.url + coordinates.join(';'), {
        params
      })
      .pipe(map((res) => this.extractRoutesData(res)));
  }

  private extractRoutesData(response): Direction[] {
    const routeResponse = [];
    response.routes.forEach((route) => {
      routeResponse.push(this.formatRoute(route, response.waypoints));
    });
    return routeResponse;
  }

  private getRouteParams(directionsOptions: DirectionOptions = {}): HttpParams {
    directionsOptions.alternatives =
      directionsOptions.alternatives !== undefined
        ? directionsOptions.alternatives
        : true;
    directionsOptions.steps =
      directionsOptions.steps !== undefined ? directionsOptions.steps : true;
    directionsOptions.geometries =
      directionsOptions.geometries !== undefined
        ? directionsOptions.geometries
        : 'geojson';
    directionsOptions.overview =
      directionsOptions.overview !== undefined
        ? directionsOptions.overview
        : false;
    directionsOptions.continue_straight =
      directionsOptions.continue_straight !== undefined
        ? directionsOptions.continue_straight
        : false;

    return new HttpParams({
      fromObject: {
        alternatives: directionsOptions.alternatives ? 'true' : 'false',
        overview: directionsOptions.overview ? 'simplified' : 'full',
        steps: directionsOptions.steps ? 'true' : 'false',
        geometries: directionsOptions.geometries
          ? directionsOptions.geometries
          : 'geojson',
        continue_straight: directionsOptions.continue_straight
          ? 'true'
          : 'false'
      }
    });
  }

  private formatRoute(roadNetworkRoute: any, waypoints: any): Direction {
    const stepsUI = [];
    roadNetworkRoute.legs.forEach((leg) => {
      leg.steps.forEach((step) => {
        stepsUI.push(step);
      });
    });
    return {
      id: uuid(),
      title: roadNetworkRoute.legs[0].summary,
      source: this.name,
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
