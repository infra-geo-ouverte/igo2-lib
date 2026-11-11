import { InjectionToken } from '@angular/core';

export const SPATIAL_FILTER_OPTIONS = new InjectionToken<SpatialFilterOptions>(
  'SpatialFilterOptions'
);

export interface SpatialFilterThematic {
  name: string;
  children?: SpatialFilterThematic[];
  group?: string;
  source?: string;
  zeroResults?: boolean;
}

export interface SpatialFilterOptions {
  url?: string;
  apiKey?: string;
}
