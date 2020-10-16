export interface SpatialFilterThematic {
  name: string;
  children?: SpatialFilterThematic[];
  group?: string;
  source?: string;
  zeroResults?: boolean;
}

export interface SpatialFilterOptions {
  url?: string;
}
