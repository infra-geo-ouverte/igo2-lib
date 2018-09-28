import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { uuid } from '@igo2/utils';
import { ConfigService, Message } from '@igo2/core';

import { Routing } from '../shared/routing.interface';
import { RoutingFormat, SourceRoutingType } from '../shared/routing.enum';

import { RoutingSource } from './routing-source';
import { RoutingSourceOptions } from './routing-source.interface';

@Injectable()
export class OsrmRoutingSource extends RoutingSource {
  get enabled(): boolean {
    return this.options.enabled !== false;
  }
  set enabled(value: boolean) {
    this.options.enabled = value;
  }
  static _name = 'OSRM Québec';
  private routingUrl =
    'https://geoegl.msp.gouv.qc.ca/services/itineraire/route/v1/driving/';
  private options: RoutingSourceOptions;

  constructor(private http: HttpClient, private config: ConfigService) {
    super();
    this.options = this.config.getConfig('routingSources.osrm') || {};
    this.routingUrl = this.options.url || this.routingUrl;
  }

  getName(): string {
    return OsrmRoutingSource._name;
  }

  route(coordinates: [number, number][]): Observable<Routing[]> {
    const routingParams = this.getRouteParams();
    return this.http
      .get<JSON[]>(this.routingUrl + coordinates.join(';'), {
        params: routingParams
      })
      .pipe(map(res => this.extractRoutesData(res)));
  }

  private extractRoutesData(response): Routing[] {
    const routeResponse = [];
    response.routes.forEach(route => {
      routeResponse.push(this.formatRoute(route, response.waypoints));
    });
    return routeResponse;
  }

  private getRouteParams(): HttpParams {
    return new HttpParams({
      fromObject: {
        overview: 'full',
        steps: 'true',
        geometries: 'geojson',
        alternatives: 'true'
      }
    });
  }

  private formatRoute(roadNetworkRoute: any, waypoints: any): Routing {
    const stepsUI = [];
    roadNetworkRoute.legs.forEach(leg => {
      leg.steps.forEach(step => {
        stepsUI.push(step);
      });
    });
    return {
      id: uuid(),
      title: roadNetworkRoute.legs[0].summary,
      source: OsrmRoutingSource._name,
      sourceType: SourceRoutingType.Route,
      order: 1,
      format: RoutingFormat.GeoJSON,
      icon: 'directions',
      projection: 'EPSG:4326',
      waypoints: waypoints,
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
