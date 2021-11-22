import olStyle from 'ol/style/Style';
import olText from 'ol/style/Text';

export interface StyleByAttribute {
    type?: string;
    attribute?: string;
    data?: Array<any>;
    fill?: Array<string>;
    stroke?: Array<string>;
    width?: Array<number>;
    radius?: Array<number>;
    icon?: Array<string>;
    scale?: Array<number>;
    label?: string | { [key: string]: any } | olText | olText[];
    baseStyle?: { [key: string]: any } | olStyle | olStyle[];
    hoverStyle?: StyleByAttribute;
}

export interface MapboxStyle {
  url: string;
  source: string;
}
