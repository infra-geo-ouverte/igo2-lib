import type { default as OlFeature } from 'ol/Feature';
import type { Type } from 'ol/geom/Geometry';

import { AnyExportFormat, CsvSeparator } from './export.type';

export interface ExportOptions {
  format?: AnyExportFormat;
  layers: string[];
  layersWithSelection?: string[];
  name?: string;
  combineLayers?: boolean;
  separator?: boolean;
  csvSeparator?: CsvSeparator;
  featureInMapExtent?: boolean;
}

export interface GeometryCollection {
  /** The geometry type */
  type: Type | null;
  features: OlFeature[];
}
