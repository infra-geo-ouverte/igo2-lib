import { GeoJsonGeometryTypes } from 'geojson';
import { RoutingFormat, SourceRoutingType } from './routing.enum';

export interface Stop {
  stopPoint?: string;
  stopProposals?: [];
  routingText?: string;
  stopCoordinates?: [number, number];
}

export interface Routing {
  id: string;
  source: string;
  sourceType?: SourceRoutingType;
  order?: number;
  title?: string;
  format?: RoutingFormat;
  icon?: string;
  projection?: string;
  waypoints?: any;
  distance?: number;
  duration?: number;
  geometry?: RoutingGeometry;
  legs?: OsrmLeg[];
  steps?: IgoStep[];
  weight?: number;
  weight_name?: string;
}
export interface RoutingGeometry {
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
  geometry?: RoutingGeometry;
  intersections?: OsrmIntersection[];
  maneuver?: OsrmManeuver;
  mode?: string;
  name?: string;
}
export interface OsrmStep {
  distance?: number;
  driving_side?: string;
  duration?: number;
  geometry?: RoutingGeometry;
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
