export interface LayerListControlsOptions {
  excludeBaseLayers?: boolean;
  showToolbar?: LayerListControlsEnum;
  keyword?: string;
  sortAlpha?: boolean;
  onlyVisible?: boolean;
}

export enum LayerListControlsEnum {
  always = 'always',
  never = 'never',
  default = 'default'
}
