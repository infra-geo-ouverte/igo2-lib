export enum DirectionsFormat {
  GeoJSON,
  JSON
}
export enum SourceDirectionsType {
  Route = 'route',
  Trip = 'trip'
}

export enum ProposalType {
  Coord = 'coord',
  Text = 'text'
}

export enum DirectionType {
  Waypoint = 'stop',
  Route = 'route',
  Vertex = 'vertex'
}

export enum DirectionRelativePositionType {
  Start = 'start',
  Intermediate = 'intermediate',
  End = 'end'
}

export enum OsrmRouteServiceOptionsAnnotations {
  Nodes = 'nodes',
  Distance = 'distance',
  Duration = 'duration',
  Datasources = 'datasources',
  Weight = 'weight',
  Speed = 'speed'
}

export enum OsrmRouteServiceOptionsGeometries {
  Polyline = 'polyline',
  Polyline6 = 'polyline6',
  Geojson = 'geojson'
}

export enum OsrmLaneIndication {
  None = 'none',
  Uturn = 'uturn',
  SharpRight = 'sharp right',
  Right = 'right',
  SlightRight = 'slight right',
  Straight = 'straight',
  SlightLeft = 'slight left',
  Left = 'left',
  SharpLeft = 'sharp left'
}

export enum OsrmStepManeuverModifier {
  Uturn = 'uturn',
  SharpRight = 'sharp right',
  Right = 'right',
  SlightRight = 'slight right',
  Straight = 'straight',
  SlightLeft = 'slight left',
  Left = 'left',
  SharpLeft = 'sharp left'
}

export enum OsrmStepManeuverType {
  Turn = 'turn',
  NewName = 'new name',
  Depart = 'depart',
  Arrive = 'arrive',
  Merge = 'merge',
  OnRamp = 'on ramp',
  OffRamp = 'off ramp',
  Fork = 'fork',
  EndOfRoad = 'end of road',
  UseLane = 'use lane',
  Continue = 'continue',
  Roundabout = 'roundabout',
  Rotary = 'rotary',
  RoundaboutTurn = 'roundabout turn',
  Notification = 'notification',
  ExitRoundabout = 'exit roundabout',
  ExitRotary = 'exit rotary'
}
