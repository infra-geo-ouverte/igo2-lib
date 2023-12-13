import { Feature } from '../../feature/shared/feature.interfaces';
import { SearchSource } from '../../search/shared/sources/source';
import { GeoJsonGeometryTypes, LineString, Position } from 'geojson';
import {
  DirectionRelativePositionType,
  DirectionType,
  DirectionsFormat,
  OsrmLaneIndication,
  OsrmRouteServiceOptionsAnnotations,
  OsrmStepManeuverModifier,
  OsrmStepManeuverType,
  ProposalType,
  SourceDirectionsType
} from './directions.enum';

export interface RouteOptions {
  alternatives?: boolean | number;
  steps?: boolean;
  annotations?: boolean | OsrmRouteServiceOptionsAnnotations
  geometries?: 'polyline' | 'polyline6' | 'geojson';
  overview?: 'simplified' | 'full' | false;
  continue_straight?: boolean;
}

export interface FeatureWithWaypoint extends Feature<FeatureWithWaypointProperties> {}
export interface FeatureWithRoute
  extends Feature<FeatureWithRouteProperties> {}
export interface FeatureWithStep extends Feature<FeatureWithStepProperties> {}

export interface FeatureWithStepProperties {
  id: string;
  step: IgoStep;
  type: DirectionType;
}
export interface FeatureWithRouteProperties {
  id: string;
  route: Route;
  type: DirectionType;
  active: boolean;
}
export interface FeatureWithWaypointProperties {
  id: string;
  waypoint: Waypoint;
  type: DirectionType;
  waypointText: string;
  waypointColor: string;
  waypointOpacity: 1;
}

export interface Waypoint {
  id: string;
  text?: string;
  searchProposals?: SourceProposal[];
  coordinates?: Position;
  position: number;
  relativePosition: DirectionRelativePositionType;
  waypointProposals?: [];
  directionsText?: string;
  waypointCoordinates?: Position;
}

export interface SourceProposal {
  type: ProposalType;
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

export interface Route {
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
  coordinates: Position[];
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
  weight?: number;
  ref?: number | string;
  pronunciation?: string;
}
export interface IgoInstruction {
  instruction: string;
  image: string;
  cssClass: string;
}
export interface OsrmRoute {
  distance?: number;
  duration?: number;
  geometry?: LineString;
  weight?: number;
  weight_name: string;
  legs: OsrmRouteLeg[];
}
export interface OsrmRouteLeg {
  distance?: number;
  duration?: number;
  weight?: number;
  summary?: string;
  steps?: OsrmRouteStep[];
  annotation?: OsrmAnnotation;
}
export interface OsrmAnnotation {
  distance?: number[];
  duration?: number[];
  datasources?: number[];
  nodes?: number[];
  weight?: number[];
  speed?: number[];
  metadata?: {datasource_names: string[]}
}
export interface OsrmRouteStep {
  distance?: number;
  duration?: number;
  geometry?: LineString;
  weight?: number;
  name?: string;
  ref?: string | number;
  pronunciation?: string;
  destinations?: any;
  exits?: number[] | string[];
  mode?: string;
  maneuver?: OsrmStepManeuver;
  intersections?: OsrmIntersection[];
  rotary_name?: string;
  rotary_pronunciation?: string;
  driving_side?: 'left' | 'right';
}
export interface OsrmStepManeuver {
  location?: Position;
  bearing_before?: number;
  bearing_after?: number;
  type?: OsrmStepManeuverType;
  modifier?: OsrmStepManeuverModifier;
  exit?: number;
}
export interface OsrmLane {
  indications?: OsrmLaneIndication[];
  valid?: boolean;
}
export interface OsrmIntersection {
  location?: Position;
  bearings?: number[];
  classes?: string[];
  entry?: boolean[];
  in?: number;
  out?: number;
  lanes?: OsrmLane[]
}
export interface OsrmWaypoint {
  name?: string;
  location?: Position;
  distance?: number;
  hint?: string;
}
