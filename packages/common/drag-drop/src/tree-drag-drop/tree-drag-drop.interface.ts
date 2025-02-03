export interface TreeFlatNode<T = any> {
  id: string;
  isGroup: boolean;
  disabled: boolean;
  level: number;
  // Give the number of level inside a group;
  descendantLevels?: number;
  data: T;
}

export interface DropPosition {
  x: number;
  y: number;
  level: number;
  type: DropPositionType;
}

export type DropPositionType = 'above' | 'below' | 'inside';
