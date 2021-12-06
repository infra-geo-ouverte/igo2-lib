import olStyle from 'ol/style/Style';

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
    label?: string | { [key: string]: any } | olStyle | olStyle[];
    baseStyle?: { [key: string]: any } | olStyle | olStyle[];
    hoverStyle?: StyleByAttribute;
}

export interface MapboxStyle {
  url: string;
  source: string;
}
