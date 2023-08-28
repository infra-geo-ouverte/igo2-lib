import olFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { Feature } from '../../../feature/shared/feature.interfaces';
import olStyle from 'ol/style/Style';

export interface FeatureCommonVectorStyleOptions extends CommonVectorStyleOptions {
  feature: Feature | olFeature<OlGeometry>;
}

export interface IgoStyle extends IgoStyleBase{
  clusterBaseStyle?: { [key: string]: any } | olStyle | olStyle[];
}
export interface IgoStyleBase {
  editable?: boolean
  hoverStyle?: StyleByAttribute;
  igoStyleObject?: { [key: string]: any };
  mapboxStyle ?: MapboxStyle;
  styleByAttribute?: StyleByAttribute;
  geoStylerStyle?: GeoStylerStyleInterfaceOptions;

}

export interface GeoStylerStyleInterfaceOptions {
  basic: GeoStylerStyleInterfaceFromGeoStyler;
  ProjetB: GeoStylerStyleInterfaceFromGeoStyler;
  hover: GeoStylerStyleInterfaceFromGeoStyler;
  /*
  name
  ruleName
  kind
  color
  width
  minScale
  maxScale
  filter
  */
}

export interface GeoStylerStyleInterfaceFromGeoStyler extends GeoStylerStyleInterfaceOptions{
  // todo check reuse their inferface.
  name?: string;
  ruleName?: string;
  kind?: string;
  wellKnownName?: string;
  color?: string;
  width?: string;
  minScale?: number;
  maxScale?: number;
}

export interface CommonVectorStyleOptions {
  markerColor?: string | number[]; // marker fill
  markerOpacity?: number; // marker opacity, not applied if a rgba is provided
  markerOutlineColor?: string | number[]; // marker contour
  fillColor?: string | number[]; // poly
  fillOpacity?: number; // poly fill opacity, not applied if a rgba is provided
  strokeColor?: string | number[]; // line and poly
  strokeOpacity?: number; // line and poly, not applied if a rgba is provided
  strokeWidth?: number; // line and poly
}

export interface StyleByAttribute {
    anchor?: Array<[number,number]>;
    type?: string;
    attribute?: string;
    data?: Array<any>;
    fill?: Array<string>;
    stroke?: Array<string>;
    width?: Array<number>;
    radius?: Array<number>;
    icon?: Array<string>;
    scale?: Array<number>;
    label?: IgoLabel;
    baseStyle?: { [key: string]: any, allo?: string };
    hoverStyle?: StyleByAttribute;
}


export interface CreateStyle {
  igoLabel?: IgoLabel,
  igoStyle?: { [key: string]: any };
}

export interface IgoLabel {
  attribute: string;
  style?: { [key: string]: any };
  minResolution?: number;
  maxResolution?: number;
  minScaleDenom?: number;
  maxScaleDenom?: number;
}

export interface MapboxStyle {
  url: string;
  source: string;
}
