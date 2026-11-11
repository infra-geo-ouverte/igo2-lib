import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { ObjectUtils, uuid } from '@igo2/utils';

import { Position } from 'geojson';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  DirectionsFormat,
  SourceDirectionsType
} from '../shared/directions.enum';
import {
  DirectionOptions,
  Directions,
  IgoStep,
  OsrmApiResponse,
  OsrmRawRoute,
  OsrmWaypoint
} from '../shared/directions.interface';
import { DirectionsSource } from './directions-source';
import {
  BaseDirectionsSourceOptionsProfile,
  OSRM_DIRECTIONS_SOURCE_OPTIONS,
  OsrmDirectionsSourceOptions
} from './directions-source.interface';

@Injectable()
export class OsrmDirectionsSource extends DirectionsSource {
  private _http = inject(HttpClient);
  private _config = inject(ConfigService);

  get options(): OsrmDirectionsSourceOptions {
    return this._options;
  }

  set options(value: OsrmDirectionsSourceOptions) {
    this._options = value;
  }

  get sourceName(): string {
    return this._options.name!;
  }

  set sourceName(value: string) {
    this._options.name = value;
  }

  get sourceId(): string {
    return this._options.id;
  }

  set sourceId(value: string) {
    this._options.id = value;
  }

  get baseUrl(): string {
    return this._options.baseUrl!;
  }

  set baseUrl(value: string) {
    this._options.baseUrl = value;
  }

  get url(): string {
    return `${this.baseUrl}${this.getEnabledProfile().name}/`;
  }

  get profiles(): BaseDirectionsSourceOptionsProfile[] {
    return this._options.profiles!;
  }

  set profiles(value: BaseDirectionsSourceOptionsProfile[]) {
    this._options.profiles = value;
  }

  private _options: OsrmDirectionsSourceOptions;

  private get headers(): HttpHeaders {
    return new HttpHeaders(
      this._options?.apiKey ? { 'x-api-key': this._options.apiKey } : undefined
    );
  }

  constructor() {
    super();
    const directOptions = inject(OSRM_DIRECTIONS_SOURCE_OPTIONS, {
      optional: true
    });
    this._options = ObjectUtils.mergeDeep(
      this._config.getConfig<OsrmDirectionsSourceOptions>(
        'directionsSources.osrm'
      ) ?? {},
      directOptions ?? {}
    ) as OsrmDirectionsSourceOptions;
    if (!this.baseUrl) {
      this.baseUrl = '/apis/itineraire/route/v1/';
    }
    if (!this.sourceId) {
      this.sourceId = 'osrmQc';
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

  getSourceId(): string {
    return this.sourceId;
  }

  getSourceName(): string {
    return this.sourceName ?? this.sourceId;
  }

  getEnabledProfile(): BaseDirectionsSourceOptionsProfile {
    return this.profiles.find((profile) => profile.enabled)!;
  }

  getProfileWithAuthorization(): BaseDirectionsSourceOptionsProfile {
    return this.profiles.find((profile) => profile.authorization)!;
  }

  route(
    coordinates: Position[],
    directionsOptions: DirectionOptions = {}
  ): Observable<Directions[]> {
    const directionsParams = this.getRouteParams(directionsOptions);
    return this.getRoute(coordinates, directionsParams);
  }

  private getRoute(
    coordinates: Position[],
    params: HttpParams
  ): Observable<Directions[]> {
    const url: string = this.url;
    return this._http
      .get<OsrmApiResponse>(url + coordinates.join(';'), {
        params,
        headers: this.headers
      })
      .pipe(map((res) => this.extractRoutesData(res)));
  }

  private extractRoutesData(response: OsrmApiResponse): Directions[] {
    const routeResponse: Directions[] = [];
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

  private formatRoute(
    roadNetworkRoute: OsrmRawRoute,
    waypoints: OsrmWaypoint[]
  ): Directions {
    const stepsUI: IgoStep[] = [];
    roadNetworkRoute.legs.forEach((leg) => {
      leg.steps?.forEach((step) => {
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
