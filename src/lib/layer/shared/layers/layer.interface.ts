export interface LayerOptions extends olx.layer.BaseOptions {
  title?: string;
  zIndex?: number;
  visible?: boolean;
  view?: olx.layer.BaseOptions;
  baseLayer?: boolean;
}

export interface LayerContext extends LayerOptions {}

export interface LayerCatalog {
  title: string;
  type: string;
  url: string;
  params: {
    layers: string;
  };
}

export interface GroupLayers {
  title: string;
  layers?: LayerCatalog;
  collapsed?: boolean;
}
