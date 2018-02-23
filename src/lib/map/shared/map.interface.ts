export interface MapViewOptions extends olx.ViewOptions {
  projection?: string;
  center?: [number, number];
  geolocate?: boolean;
}


export interface ControlsMapOptions {
  attribution?: boolean | olx.control.AttributionOptions;
  scaleLine?: boolean | olx.control.ScaleLineOptions;
}

export interface MapOptions {
  controls?: ControlsMapOptions;
  overlay?: boolean;
  interactions?: boolean;
}
