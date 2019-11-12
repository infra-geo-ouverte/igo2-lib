export interface SpatialFilterThematic {
  name: string;
  children?: SpatialFilterThematic[];
  group?: string;
}

export interface FlatNode {
  name: string;
  expandable?: boolean;
  level?: number;
}
