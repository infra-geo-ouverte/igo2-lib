export interface TreeDropEvent<T> {
  node: T;
  ref: T;
  position: DropPositionType;
}

export interface DropPosition {
  x: number;
  y: number;
  level: number;
  type: DropPositionType;
}

export type DropPositionType = 'above' | 'below' | 'inside';

export interface DropPermission {
  canDrop: boolean;
  message?: string;
  params?: Record<string, unknown>;
}
