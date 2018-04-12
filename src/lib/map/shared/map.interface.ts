import * as ol from 'openlayers';

export interface MapViewOptions extends ol.olx.ViewOptions {
  projection?: string;
  center?: [number, number];
  geolocate?: boolean;
}

export interface ControlsMapOptions {
  attribution?: boolean | ol.olx.control.AttributionOptions;
  scaleLine?: boolean | ol.olx.control.ScaleLineOptions;
}

export interface MapOptions {
  controls?: ControlsMapOptions;
  overlay?: boolean;
  interactions?: boolean;
}
