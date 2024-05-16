import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { uuid } from '@igo2/utils';

import { Position } from 'geojson';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  DirectionsFormat,
  SourceDirectionsType
} from '../shared/directions.enum';
import { Direction, DirectionOptions } from '../shared/directions.interface';
import { DirectionsSource } from './directions-source';
import {
  BaseDirectionsSourceOptionsProfile,
  OsrmDirectionsSourceOptions
} from './directions-source.interface';

@Injectable()
export class OsrmDirectionsSource extends DirectionsSource {
  get options(): OsrmDirectionsSourceOptions {
    return this._options;
  }

  set options(value: OsrmDirectionsSourceOptions) {
    this._options = value;
  }

  get sourceName(): string {
    return this._options.name;
  }

  set sourceName(value: string) {
    this._options.name = value;
  }

  get baseUrl(): string {
    return this._options.baseUrl;
  }

  set baseUrl(value: string) {
    this._options.baseUrl = value;
  }

  get url(): string {
    return `${this.baseUrl}${this.getEnabledProfile().name}/`;
  }

  get profiles(): BaseDirectionsSourceOptionsProfile[] {
    return this._options.profiles;
  }

  set profiles(value: BaseDirectionsSourceOptionsProfile[]) {
    this._options.profiles = value;
  }

  private _options: OsrmDirectionsSourceOptions;

  constructor(
    private _http: HttpClient,
    private _config: ConfigService
  ) {
    super();
    this._options = this._config.getConfig('directionsSources.osrm');
    if (!this.baseUrl) {
      this.baseUrl = '/apis/itineraire/route/v1/';
    }

    if (!this.sourceName) {
      this.sourceName = 'OSRM Québec';
    }

    if (!this.profiles) {
      const profile: BaseDirectionsSourceOptionsProfile = {
        enabled: true,
        name: 'driving'
      };
      this.profiles = [profile];
    } else {
      if (!this.profiles.find((profile) => profile.enabled)) {
        this.profiles[0].enabled = true;
      }
    }
  }

  getSourceName(): string {
    return this.sourceName;
  }

  getEnabledProfile(): BaseDirectionsSourceOptionsProfile {
    return this.profiles.find((profile) => profile.enabled);
  }

  getProfileWithAuthorization(): BaseDirectionsSourceOptionsProfile {
    return this.profiles.find((profile) => profile.authorization);
  }

  route(
    coordinates: Position[],
    directionsOptions: DirectionOptions = {}
  ): Observable<Direction[]> {
    const directionsParams = this.getRouteParams(directionsOptions);
    return this.getRoute(coordinates, directionsParams);
  }

  private getRoute(
    coordinates: Position[],
    params: HttpParams
  ): Observable<Direction[]> {
    const url: string = this.url;
    return this._http
      .get<JSON[]>(url + coordinates.join(';'), {
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
      source: this.url,
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
