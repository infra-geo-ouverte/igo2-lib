export interface MapViewOptions {
  projection?: string;
  center?: [number, number];
  geolocate?: boolean;

  constrainRotation?: boolean | number;
  enableRotation?: boolean;
  extent?: [number, number, number, number];
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

export interface ControlsMapOptions {
  attribution?: boolean | AttributionOptions;
  scaleLine?: boolean | ScaleLineOptions;
}

export interface MapOptions {
  controls?: ControlsMapOptions;
  overlay?: boolean;
  interactions?: boolean;
}

export interface ScaleLineOptions {
  className?: string;
  minWidth?: number;
  target?: Element;
  units?: string;
}

export interface AttributionOptions {
  html?: string;
  collapsed: boolean;
}
