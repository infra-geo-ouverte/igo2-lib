export interface SpatialFilterThematic {
  name: string;
  children?: SpatialFilterThematic[];
  group?: string;
  source?: string;
}

export interface SpatialFilterOptions {
  url?: string;
}
