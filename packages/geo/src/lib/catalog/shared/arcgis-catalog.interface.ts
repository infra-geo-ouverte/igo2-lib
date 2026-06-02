export interface ArcgisLayerOptions {
  name?: string;
  description?: string;
  copyrightText?: string;
  units?: string;
  fields?: unknown;
  displayField?: string;
  drawingInfo?: { renderer?: unknown };
  timeInfo?: { timeExtent: number[] };
  minScale?: number;
  maxScale?: number;
}

export interface ArcgisServiceCapabilities {
  serviceDescription?: string;
}

export interface ArcgisLegendInfo {
  layers?: { layerName: string }[];
}
