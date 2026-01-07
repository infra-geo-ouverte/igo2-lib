import { Style as GeostylerStyle } from 'geostyler-style';

export interface IgoStyle {
  editable?: boolean;
  geostylerStyle?: GeostylerStyleInterfaceOptions;
}
export interface GeostylerStyleInterfaceOptions {
  global?: GeostylerStyle;
}

export interface LayerInteractionStyleOptions {
  base?: GeostylerStyle;
  selection?: GeostylerStyle;
  focus?: GeostylerStyle;
}
