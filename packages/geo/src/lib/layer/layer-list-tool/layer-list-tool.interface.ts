export interface LayerListControlsOptions {
  excludeBaseLayers?: boolean;
  showToolbar?: LayerListControlsEnum;
  keyword?: string;
  sortAlpha?: boolean;
  onlyVisible?: boolean;
}

export enum LayerListToolControlsEnum {
  always = 'always',
  never = 'never',
  default = 'default'
}

export enum LayerListControlsEnum {
  always = 'always',
  never = 'never',
  default = 'default'
}
