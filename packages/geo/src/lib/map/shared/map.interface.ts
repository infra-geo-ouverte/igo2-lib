export type MapExtent = [number, number, number, number];

export interface MapViewOptions {
  projection?: string;
  center?: [number, number];
  geolocate?: boolean;

  constrainRotation?: boolean | number;
  enableRotation?: boolean;
  extent?: MapExtent;
  maxResolution?: number;
  minResolution?: number;
  maxZoom?: number;
  minZoom?: number;
  resolution?: number;
  resolutions?: number[];
  rotation?: number;
  zoom?: number;
  zoomFactor?: number;
}

export interface MapViewState {
  resolution: number;
  center: [number, number];
  zoom: number;
}

export interface MapOptions {
  controls?: {
    attribution?: boolean | MapAttributionOptions;
    scaleLine?: boolean | MapScaleLineOptions;
  };
  overlay?: boolean;
  interactions?: boolean;
}

export interface MapScaleLineOptions {
  className?: string;
  minWidth?: number;
  target?: Element;
  units?: string;
}

export interface MapAttributionOptions {
  html?: string;
  collapsed: boolean;
}
