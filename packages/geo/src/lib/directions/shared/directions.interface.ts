import { GeoJsonGeometryTypes } from 'geojson';

import { Feature } from '../../feature/shared/feature.interfaces';
import { SearchMeta } from '../../search';
import { SearchSource } from '../../search/shared/sources/source';
import {
  DirectionRelativePositionType,
  DirectionType,
  DirectionsFormat,
  ProposalType,
  SourceDirectionsType
} from './directions.enum';

export interface DirectionOptions {
  overview?: boolean;
  steps?: boolean;
  geometries?: string;
  alternatives?: boolean;
  continue_straight?: boolean;
}

export type FeatureWithStop = Feature<FeatureWithStopProperties>;
export type FeatureWithDirection = Feature<FeatureWithDirectionProperties>;
export type FeatureWithStep = Feature<FeatureWithStepProperties>;

export interface FeatureWithStepProperties {
  id: string;
  step: IgoStep;
  type: DirectionType;
}
export interface FeatureWithDirectionProperties {
  id: string;
  direction: Direction;
  type: DirectionType;
  active: boolean;
}
export interface FeatureWithStopProperties {
  id: string;
  stop: Stop;
  type: DirectionType;
  stopText: string;
  stopColor: string;
  stopOpacity: 1;
}

export interface Stop {
  id: string;
  text?: string;
  searchProposals?: SourceProposal[];
  coordinates?: [number, number];
  position: number;
  relativePosition: DirectionRelativePositionType;
  stopPoint?: string;
  stopProposals?: [];
  directionsText?: string;
  stopCoordinates?: [number, number];
}

export interface SourceProposal {
  type: ProposalType;
  source: SearchSource;
  results: Record<string, any>[];
  meta: SearchMeta;
}

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
