import { LayerListControlsEnum } from '@igo2/geo';

export interface MapDetailsToolOptions {
  toggleLegendOnVisibilityChange?: boolean;
  ogcFiltersInLayers?: boolean;
  layerListControls?: LayerListControlsOptions;
}

export interface LayerListControlsOptions {
  excludeBaseLayers?: boolean;
  showToolbar?: LayerListControlsEnum;
  toolbarThreshold?: number;
  keyword?: string;
  sortedAlpha?: boolean;
  onlyVisible?: boolean;
  onlyInRange?: boolean;
}
