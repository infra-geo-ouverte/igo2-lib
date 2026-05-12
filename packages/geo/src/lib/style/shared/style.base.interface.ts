export interface BaseLayerStyle<
  TType extends string = string,
  TStyle = unknown
> {
  type: TType;
  style?: TStyle;
}
