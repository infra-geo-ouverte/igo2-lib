import { GeostylerLayerStyle } from '../geostyler/geostyler.interface';
import { MapboxLayerStyle } from '../mapbox/mapbox.interface';
import { AnyOlStyle } from './style.interface';

export type LayerStyle = GeostylerLayerStyle | MapboxLayerStyle;
export type AnyStyle = LayerStyle | AnyOlStyle;
