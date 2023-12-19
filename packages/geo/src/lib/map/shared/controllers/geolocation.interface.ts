import { ProjectionLike } from 'ol/proj';

export interface GeolocationOptions {
  activateDefault?: boolean;
  basic?: boolean; // to control the button icon.
  followPosition?: boolean; // to overide the followPosition define at the context level.
  button?: {
    visible: boolean;
  };
}

export interface MapGeolocationControllerOptions {
  projection: ProjectionLike;
  accuracyThreshold?: number;
  followPosition?: boolean;
  buffer?: GeolocationBuffer;
}

export interface MapGeolocationState {
  position: number[];
  projection: string;
  accuracy: number;
  altitude: number;
  altitudeAccuracy: number;
  heading: number;
  speed: number;
  enableHighAccuracy: boolean;
  timestamp: Date;
}
export interface GeolocationBuffer {
  bufferRadius?: number;
  bufferStroke?: [number, number, number, number];
  bufferFill?: [number, number, number, number];
  showBufferRadius?: boolean;
}

export enum GeolocationOverlayType {
  Position = 'position',
  PositionDirection = 'positionDirection',
  Accuracy = 'accuracy',
  Buffer = 'buffer'
}
