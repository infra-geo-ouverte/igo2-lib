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
    baseStyle?: { [key: string]: any };
    hoverStyle?: StyleByAttribute;
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
