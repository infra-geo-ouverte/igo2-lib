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

export enum DirectionsType {
  Stop = 'stop',
  Route = 'route',
  Vertex = 'vertex'
}

export enum DirectionRelativePositionType {
  Start = 'start',
  Intermediate = 'intermediate',
  End = 'end'
}

export enum ManeuverType {
  Turn = 'turn',
  NewName = 'new name',
  Depart = 'depart',
  Arrive = 'arrive',
  Merge = 'merge',
  Ramp = 'ramp',
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

export enum ManeuverModifier {
  Uturn = 'uturn',
  SharpRight = 'sharp right',
  Right = 'right',
  SlightRight = 'slight right',
  SharpLeft = 'sharp left',
  Left = 'left',
  SlightLeft = 'slight left',
  Straight = 'straight'
}

export enum LaneType {
  None = 'none',
  Uturn = 'uturn',
  SharpRight = 'sharp right',
  Right = 'right',
  SlightRight = 'slight right',
  SharpLeft = 'sharp left',
  Left = 'left',
  SlightLeft = 'slight left',
  Straight = 'straight'
}
