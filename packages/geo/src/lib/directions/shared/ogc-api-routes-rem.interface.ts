import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position
} from 'geojson';

export type OgcApiRoutesFeatureType =
  | 'overview'
  | 'start'
  | 'waypoint'
  | 'end'
  | 'segment';

export type OgcApiRoutesProperties = Exclude<GeoJsonProperties, null> & {
  featureType?: OgcApiRoutesFeatureType;
  name?: string;
  length_m?: number;
  duration_s?: number;
};

export type OgcApiRoutesFeature = Feature<Geometry, OgcApiRoutesProperties>;

export type OgcApiRoutesApiResponse = FeatureCollection<
  Geometry,
  OgcApiRoutesProperties
> & {
  name?: string;
};

export type OgcApiRoutesBooleanQueryValue = 'true' | 'false';

export type OgcApiRoutesQueryParams = Record<string, string> & {
  overview: OgcApiRoutesBooleanQueryValue;
  steps: OgcApiRoutesBooleanQueryValue;
  alternatives: OgcApiRoutesBooleanQueryValue;
  profile: string;
};

export interface OgcApiRoutesPostBody {
  name?: string;
  inputs: {
    waypoints: {
      value: {
        type: 'MultiPoint';
        coordinates: Position[];
      };
    };
    mode?: string;
    preference?: string;
    start?: {
      value: Position;
    };
    end?: {
      value: Position;
    };
    intermediate?: {
      value: Position[];
    };
    [key: string]: unknown;
  };
}
