import { LayerListControlsOptions } from '../layer-list-tool/layer-list-tool.interface';

export interface LayerConfig {
  group?: {
    enable: boolean;
    maxHierarchyLevel?: number;
    canCreate?: boolean;
    canRename?: boolean;
  };
  /** Représente l'icon en préfix au titre qui affiche le type de source */
  typeIcon?: {
    disableTooltip?: boolean;
  };
}

export interface LayerViewerOptions extends LayerConfig {
  mode?: LayerToolMode;
  queryBadge?: boolean;
  legend?: Partial<ViewerLegendOptions>;
  filterAndSortOptions?: LayerListControlsOptions;
}

interface ViewerLegendOptions {
  showOnVisibilityChange: boolean;
  updateOnResolutionChange: boolean;
  showForVisibleLayers: boolean;
}

export type LayerToolMode = 'selection';
