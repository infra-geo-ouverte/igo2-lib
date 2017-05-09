export interface LayerOptions extends olx.layer.BaseOptions {
  title?: string;
  zIndex?: number;
  visible?: boolean;
  view?: olx.layer.BaseOptions;
}

export interface LayerContext extends LayerOptions {}
