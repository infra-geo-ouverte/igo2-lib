export interface LayerOptions extends olx.layer.BaseOptions {
  type?: string;
  title?: string;
  alias?: string;
  zIndex?: number;
  visible?: boolean;
  view?: olx.layer.BaseOptions;
}
