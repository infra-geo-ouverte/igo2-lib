import { Geometry } from 'geojson';
import { SpatialFilterQueryType } from './spatial-filter.enum';

export interface SpatialFilterOptions {
  code: string;
  nom: string;
  requestGeometry: Geometry;
  queryType?: SpatialFilterQueryType;
}
