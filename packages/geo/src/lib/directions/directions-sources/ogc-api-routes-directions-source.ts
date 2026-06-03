import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { uuid } from '@igo2/utils';

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
  DirectionsGeometry
} from '../shared/directions.interface';
import {
  OgcApiRoutesApiResponse,
  OgcApiRoutesBooleanQueryValue,
  OgcApiRoutesFeature,
  OgcApiRoutesFeatureType,
  OgcApiRoutesPostBody,
  OgcApiRoutesQueryParams
} from '../shared/ogc-api-routes-rem.interface';
import { DirectionsSource } from './directions-source';
import {
  BaseDirectionsSourceOptionsProfile,
  OgcApiRoutesDirectionsSourceOptions
} from './directions-source.interface';

@Injectable()
export class OgcApiRoutesDirectionsSource extends DirectionsSource {
  private _http = inject(HttpClient);
  private _config = inject(ConfigService);

  get options(): OgcApiRoutesDirectionsSourceOptions {
    return this._options;
  }

  set options(value: OgcApiRoutesDirectionsSourceOptions) {
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

  get profiles(): BaseDirectionsSourceOptionsProfile[] {
    return this._options.profiles!;
  }

  set profiles(value: BaseDirectionsSourceOptionsProfile[]) {
    this._options.profiles = value;
  }

  private _options: OgcApiRoutesDirectionsSourceOptions;

  constructor() {
    super();
    this._options =
      this._config.getConfig('directionsSources.ogcApiRoutes') ??
      ({
        id: 'ogc-api-routes',
        baseUrl: '/apis/routes'
      } as OgcApiRoutesDirectionsSourceOptions);

    if (!this.baseUrl) {
      this.baseUrl = '/apis/routes';
    }

    if (!this.sourceName) {
      this.sourceName = 'OGC API Routes';
    }

    if (!this.profiles || this.profiles.length === 0) {
      this.profiles = [{ enabled: true, name: 'default' }];
    } else if (!this.profiles.find((profile) => profile.enabled)) {
      this.profiles[0].enabled = true;
    }

    if (!this.options.routePath) {
      this.options.routePath = '/routes';
    }
    if (!this.options.httpMethod) {
      this.options.httpMethod = 'POST';
    }
    if (!this.options.waypointsParam) {
      this.options.waypointsParam = 'waypoints';
    }
    if (!this.options.coordinateSeparator) {
      this.options.coordinateSeparator = ',';
    }
    if (!this.options.waypointSeparator) {
      this.options.waypointSeparator = ';';
    }
  }

  getSourceName(): string {
    return this.sourceName;
  }

  getSourceId(): string {
    return this.sourceId;
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
    const endpoint = this.buildEndpoint();

    if (this.options.httpMethod === 'POST') {
      return this._http
        .post<OgcApiRoutesApiResponse>(
          endpoint,
          this.buildPostBody(coordinates, directionsOptions)
        )
        .pipe(map((response) => this.extractRoutesData(response)));
    }

    const params = this.buildParams(coordinates, directionsOptions);
    return this._http
      .get<OgcApiRoutesApiResponse>(endpoint, { params })
      .pipe(map((response) => this.extractRoutesData(response)));
  }

  private buildEndpoint(): string {
    const baseUrl = this.baseUrl.replace(/\/+$/, '');
    const routePath = (this.options.routePath ?? '/routes').replace(/^\/+/, '');
    return `${baseUrl}/${routePath}`;
  }

  private buildParams(
    coordinates: Position[],
    directionsOptions: DirectionOptions
  ): HttpParams {
    const waypointsParam = this.options.waypointsParam ?? 'waypoints';
    const overview: OgcApiRoutesBooleanQueryValue =
      directionsOptions.overview !== false ? 'true' : 'false';
    const steps: OgcApiRoutesBooleanQueryValue =
      directionsOptions.steps !== false ? 'true' : 'false';
    const alternatives: OgcApiRoutesBooleanQueryValue =
      directionsOptions.alternatives === true ? 'true' : 'false';

    const fromObject: OgcApiRoutesQueryParams = {
      [waypointsParam]: this.formatWaypoints(coordinates),
      overview,
      steps,
      alternatives,
      profile: this.getEnabledProfile().name
    };

    return new HttpParams({ fromObject });
  }

  private formatCoordinate(position: Position): string {
    const sep = this.options.coordinateSeparator ?? ',';
    return [position[0], position[1]].join(sep);
  }

  private buildPostBody(
    coordinates: Position[],
    directionsOptions: DirectionOptions
  ): OgcApiRoutesPostBody {
    const profileName = this.getEnabledProfile().name;
    const start = coordinates[0];
    const end = coordinates[coordinates.length - 1];
    const intermediate = coordinates.slice(1, -1);

    return {
      inputs: {
        waypoints: {
          value: {
            type: 'MultiPoint',
            coordinates
          }
        },
        // mode is part of OGC API Routes mode extension (/inputs/mode).
        mode: profileName,
        // Keep explicit route-definition fields for servers supporting them.
        start: start ? { value: start } : undefined,
        end: end ? { value: end } : undefined,
        intermediate:
          intermediate.length > 0 ? { value: intermediate } : undefined,
        preference:
          directionsOptions.alternatives === true ? 'shortest' : 'fastest'
      }
    };
  }

  private formatWaypoints(coordinates: Position[]): string {
    const waypointSeparator = this.options.waypointSeparator ?? ';';
    return coordinates
      .map((c) => this.formatCoordinate(c))
      .join(waypointSeparator);
  }

  private extractRoutesData(response: OgcApiRoutesApiResponse): Directions[] {
    if (!this.isRemFeatureCollection(response)) {
      return [];
    }

    const features = response.features;
    if (!this.hasRequiredRemComponents(features)) {
      return [];
    }

    const overviewFeatures = features.filter((feature) =>
      this.isOverviewFeature(feature)
    );

    return overviewFeatures
      .map((feature, index) =>
        this.mapFeatureToDirection(feature, response.name, index)
      )
      .filter((direction): direction is Directions => direction !== undefined);
  }

  private mapFeatureToDirection(
    feature: OgcApiRoutesFeature,
    collectionName: string | undefined,
    index: number
  ): Directions | undefined {
    const geometry = feature.geometry;
    if (!geometry) {
      return;
    }

    const { type } = geometry;
    const coordinates = (geometry as { coordinates?: unknown }).coordinates;
    if (
      !(type === 'LineString' || type === 'MultiLineString') ||
      !Array.isArray(coordinates)
    ) {
      return;
    }

    const { properties } = feature;

    const title =
      collectionName ??
      this.readString(properties, 'name') ??
      `Route ${index + 1}`;

    const distance = this.readNumber(properties, 'length_m');

    const duration = this.readNumber(properties, 'duration_s');

    const directionGeometry: DirectionsGeometry = {
      type: type as 'LineString' | 'MultiLineString',
      coordinates: coordinates as unknown as DirectionsGeometry['coordinates']
    };

    return {
      id: uuid(),
      title,
      source: this.buildEndpoint(),
      sourceType: SourceDirectionsType.Route,
      order: index + 1,
      format: DirectionsFormat.GeoJSON,
      icon: 'directions',
      projection: 'EPSG:4326',
      distance,
      duration,
      geometry: directionGeometry,
      steps: []
    };
  }

  private readString(
    input: Record<string, unknown>,
    key: string
  ): string | undefined {
    const value = input[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  private readNumber(
    input: Record<string, unknown>,
    key: string
  ): number | undefined {
    const value = input[key];
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isRemFeatureCollection(
    response: unknown
  ): response is OgcApiRoutesApiResponse {
    if (!this.isRecord(response)) {
      return false;
    }

    if (response['type'] !== 'FeatureCollection') {
      return false;
    }

    if (!Array.isArray(response['features'])) {
      return false;
    }

    return response['features'].every((feature) =>
      this.isOgcApiRoutesFeature(feature)
    );
  }

  private isOgcApiRoutesFeature(
    feature: unknown
  ): feature is OgcApiRoutesFeature {
    if (!this.isRecord(feature)) {
      return false;
    }

    if (feature['type'] !== 'Feature') {
      return false;
    }

    const geometry = feature['geometry'];
    const properties = feature['properties'];
    if (!this.isRecord(geometry) || !this.isRecord(properties)) {
      return false;
    }

    return typeof geometry['type'] === 'string' && 'coordinates' in geometry;
  }

  private hasRequiredRemComponents(features: OgcApiRoutesFeature[]): boolean {
    return (
      features.some((feature) => this.isOverviewFeature(feature)) &&
      features.some((feature) => this.getFeatureType(feature) === 'start') &&
      features.some((feature) => this.getFeatureType(feature) === 'end') &&
      features.some((feature) => this.getFeatureType(feature) === 'segment')
    );
  }

  private isOverviewFeature(feature: OgcApiRoutesFeature): boolean {
    const geometryType = feature.geometry?.type;
    const featureType = this.getFeatureType(feature);

    return featureType === 'overview' && geometryType === 'LineString';
  }

  private getFeatureType(
    feature: OgcApiRoutesFeature
  ): OgcApiRoutesFeatureType | undefined {
    const featureType = feature.properties.featureType;
    return this.isOgcApiRoutesFeatureType(featureType)
      ? featureType
      : undefined;
  }

  private isOgcApiRoutesFeatureType(
    value: unknown
  ): value is OgcApiRoutesFeatureType {
    return (
      value === 'overview' ||
      value === 'start' ||
      value === 'waypoint' ||
      value === 'end' ||
      value === 'segment'
    );
  }
}
