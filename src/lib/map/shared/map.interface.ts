export interface MapViewOptions extends olx.ViewOptions {
  projection?: string;
  center?: [number, number];
  geolocate?: boolean;
}


export interface ControlsMapOptions {
  attribution?: boolean;
}

export interface MapOptions {
  controls?: ControlsMapOptions;
  overlay?: boolean;
  interactions?: boolean;
}
