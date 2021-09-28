import { GeoJsonGeometryTypes } from 'geojson';
import { DirectionsFormat, SourceDirectionsType } from './directions.enum';

import { Feature } from '../../feature/shared/feature.interfaces';
import { SearchSource } from '../../search/shared/sources/source';

// todo delete
export interface DirectionsOptions extends DirectionOptions { }

export interface DirectionOptions {
  overview?: boolean;
  steps?: boolean;
  geometries?: string;
  alternatives?: boolean;
}

export interface FeatureWithStop extends Feature<FeatureWithStopProperties> {}
export interface FeatureWithDirection extends Feature<FeatureWithDirectionProperties> { }

export interface FeatureWithDirectionProperties {
  id: string;
  direction: Direction[];
}
export interface FeatureWithStopProperties {
  id: string;
  stop: Stop;
  type: 'stop';
  stopText: string;
  stopColor: string;
  stopOpacity: 1;
}

export interface Stop {
  id: string;
  order: number;
  text?: string;
  searchProposals?: SourceProposal[];
  coordinates?: [number, number];
  relativePosition?: string;
  stopPoint?: string;
  stopProposals?: [];
  directionsText?: string;
  stopCoordinates?: [number, number];
}

export interface SourceProposal {
  source: SearchSource;
  results: { [key: string]: any }[];
  meta: {
    dataType: string;
    id: string;
    title: string;
    titleHtml?: string;
    icon: string;
    score?: number;
    nextPage?: boolean;
  };
}

// todo delete
export interface Directions extends Direction { }
export interface Direction {
  id: string;
  source: string;
  sourceType?: SourceDirectionsType;
  order?: number;
  title?: string;
  format?: DirectionsFormat;
  icon?: string;
  projection?: string;
  waypoints?: any;
  distance?: number;
  duration?: number;
  geometry?: DirectionsGeometry;
  legs?: OsrmLeg[];
  steps?: IgoStep[];
  weight?: number;
  weight_name?: string;
}
export interface DirectionsGeometry {
  type: GeoJsonGeometryTypes;
  coordinates: [any];
}
export interface OsrmLeg {
  distance?: number;
  duration?: number;
  steps?: OsrmStep[];
  summary: string;
  weight?: number;
}
export interface IgoStep {
  // REFER TO THIS INTERFACE FOR VARIOUS SOURCE
  distance?: number;
  driving_side?: string;
  duration?: number;
  geometry?: DirectionsGeometry;
  intersections?: OsrmIntersection[];
  maneuver?: OsrmManeuver;
  mode?: string;
  name?: string;
}
export interface OsrmStep {
  distance?: number;
  driving_side?: string;
  duration?: number;
  geometry?: DirectionsGeometry;
  intersections?: OsrmIntersection[];
  maneuver?: OsrmManeuver;
  mode?: string;
  name?: string;
}
export interface OsrmIntersection {
  bearing?: [any];
  entry?: [boolean];
  location?: [number, number];
  out?: number;
}
export interface OsrmManeuver {
  bearing_after?: number;
  bearing_before?: number;
  location?: [number, number];
  modifier?: string;
  type?: string;
}
