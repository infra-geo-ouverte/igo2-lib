export interface MapViewOptions extends olx.ViewOptions {
  projection?: string;
  center?: [number, number];
  geolocate?: boolean;
  attributionCollapse?: boolean;
}


export interface ControlsMapOptions {
  attribution?: boolean;
  scaleLine?: boolean;
}

export interface MapOptions {
  controls?: ControlsMapOptions;
  overlay?: boolean;
  interactions?: boolean;
}
