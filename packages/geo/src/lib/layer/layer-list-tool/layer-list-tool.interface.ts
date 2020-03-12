import { LayerListControlsEnum } from '../layer-list/layer-list.enum';

export interface LayerListControlsOptions {
  excludeBaseLayers?: boolean;
  showToolbar?: LayerListControlsEnum;
  keyword?: string;
  sortAlpha?: boolean;
  onlyVisible?: boolean;
}
