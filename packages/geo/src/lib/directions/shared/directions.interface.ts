import { Coordinate } from 'ol/coordinate';

import { GeoJsonGeometryTypes } from 'geojson';

import { Feature } from '../../feature/shared/feature.interfaces';
import { SearchMeta } from '../../search';
import { SearchSource } from '../../search/shared/sources/source';
import {
  DirectionRelativePositionType,
  DirectionsFormat,
  DirectionsType,
  LaneType,
  ManeuverModifier,
  ManeuverType,
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
export type FeatureWithDirections = Feature<FeatureWithDirectionsProperties>;
export type FeatureWithStep = Feature<FeatureWithStepProperties>;

export interface FeatureWithStepProperties {
  id: string;
  step: IgoStep;
  type: DirectionsType;
}
export interface FeatureWithDirectionsProperties {
  id: string;
  directions: Directions;
  type: DirectionsType;
  active: boolean;
}
export interface FeatureWithStopProperties {
  id: string;
  stop: Stop;
  type: DirectionsType;
  stopText: string;
  stopColor: string;
  stopOpacity: 1;
}

export interface Stop {
  id: string;
  text?: string;
  searchProposals?: SourceProposal[];
  coordinates?: Coordinate;
  position: number;
  relativePosition: DirectionRelativePositionType;
  stopPoint?: string;
  stopProposals?: [];
  directionsText?: string;
}

export interface SourceProposal {
  type: ProposalType;
  source: SearchSource;
  results: Record<string, any>[];
  meta: SearchMeta;
}

export interface Directions {
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
  legs?: OsrmRouteLeg[];
  steps?: IgoStep[];
  weight?: number;
  weight_name?: string;
}
export interface DirectionsGeometry {
  type: GeoJsonGeometryTypes;
  coordinates: Coordinate;
}
export interface OsrmRouteLeg {
  distance?: number;
  duration?: number;
  steps?: OsrmRouteStep[];
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
  maneuver?: OsrmStepManeuver;
  mode?: string;
  name?: string;
}

export interface FormattedStep {
  instruction: string;
  iconName: string;
}

export interface OsrmRouteStep {
  destinations?: string[];
  distance?: number;
  driving_side?: string;
  duration?: number;
  exits: number[] | string[];
  geometry?: DirectionsGeometry;
  intersections?: OsrmIntersection[];
  maneuver?: OsrmStepManeuver;
  mode?: string;
  name?: string;
  pronunciation?: string;
  rotary_name?: string;
  rotary_pronunciation?: string;
  ref?: number | string;
  weight?: number;
}

export interface OsrmStepManeuver {
  bearing_after?: number;
  bearing_before?: number;
  exit?: number;
  location?: [number, number];
  modifier?: ManeuverModifier;
  type?: ManeuverType;
}

export interface OsrmLane {
  indications: LaneType[];
  valid: boolean;
}

export interface OsrmIntersection {
  bearings?: number[];
  classes?: string[];
  entry?: boolean[];
  in?: number;
  lanes?: OsrmLane[];
  location?: [number, number];
  out?: number;
}

export interface OsrmWaypoint {
  distance?: number;
  hint?: string;
  location: [number, number];
  name?: string;
}
