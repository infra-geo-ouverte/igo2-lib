import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core';
import { customCacheHasher, uuid } from '@igo2/utils';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';

import { OsrmRoute, OsrmRouteLeg, OsrmRouteStep, OsrmWaypoint, Route, RouteOptions } from '../shared/directions.interface';
import {
  DirectionsFormat,
  SourceDirectionsType
} from '../shared/directions.enum';
import { DirectionsSource } from './directions-source';
import { OsrmDirectionsSourceOptions } from './directions-source.interface';
import { Position } from 'geojson';

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
  private options: OsrmDirectionsSourceOptions;

  constructor(
    private _http: HttpClient,
    private _config: ConfigService
  ) {
    super();
    this.options = this._config.getConfig('directionsSources.osrm') || {};
    this.directionsUrl = this.options.url || this.directionsUrl;
  }

  getName(): string {
    return OsrmDirectionsSource._name;
  }

  route(
    coordinates: Position[],
    routeOptions: RouteOptions = {}
  ): Observable<Route[]> {
    const routeParams: HttpParams = this._getRouteParams(routeOptions);
    return this._getRoute(coordinates, routeParams);
  }

  @Cacheable({
    maxCacheCount: 20,
    cacheHasher: customCacheHasher
  })
  private _getRoute(
    coordinates: Position[],
    params: HttpParams
  ): Observable<Route[]> {
    return this._http
      .get<JSON[]>(this.directionsUrl + coordinates.join(';'), {
        params
      })
      .pipe(map((response) => this._extractRoutesData(response)));
  }

  private _extractRoutesData(response: any): Route[] {
    const routes: Route[] = [];
    response.routes.forEach((route: OsrmRoute) => {
      routes.push(this._formatRoute(route, response.waypoints));
    });
    return routes;
  }

  private _getRouteParams(routeOptions: RouteOptions = {}): HttpParams {
    routeOptions.alternatives =
      routeOptions.alternatives !== undefined
        ? routeOptions.alternatives
        : true;
    routeOptions.steps =
      routeOptions.steps !== undefined ? routeOptions.steps : true;
    routeOptions.geometries =
      routeOptions.geometries !== undefined
        ? routeOptions.geometries
        : 'geojson';
    routeOptions.overview =
      routeOptions.overview !== undefined
        ? routeOptions.overview
        : false;
    routeOptions.continue_straight =
      routeOptions.continue_straight !== undefined
        ? routeOptions.continue_straight
        : false;

    return new HttpParams({
      fromObject: {
        alternatives: routeOptions.alternatives,
        overview: routeOptions.overview ? 'simplified' : 'full',
        steps: routeOptions.steps ? 'true' : 'false',
        geometries: routeOptions.geometries
          ? routeOptions.geometries
          : 'geojson',
        continue_straight: routeOptions.continue_straight
          ? 'true'
          : 'false'
      }
    });
  }

  private _formatRoute(route: OsrmRoute, waypoints: OsrmWaypoint[]): Route {
    const stepsUI: OsrmRouteStep[] = [];
    route.legs.forEach((leg: OsrmRouteLeg) => {
      leg.steps.forEach((step: OsrmRouteStep) => {
        stepsUI.push(step);
      });
    });
    return {
      id: uuid(),
      title: route.legs[0].summary,
      source: OsrmDirectionsSource._name,
      sourceType: SourceDirectionsType.Route,
      order: 1,
      format: DirectionsFormat.GeoJSON,
      icon: 'directions',
      projection: 'EPSG:4326',
      waypoints,
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      legs: route.legs,
      steps: stepsUI,
      weight: route.weight,
      weight_name: route.weight_name
    };
  }
}
