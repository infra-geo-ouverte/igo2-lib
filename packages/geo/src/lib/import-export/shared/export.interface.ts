import type { default as OlFeature } from 'ol/Feature';
import type { Type } from 'ol/geom/Geometry';

import type { LayerId } from '../../layer';
import { AnyExportFormat, CsvSeparator } from './export.type';

export const RADIUS_NAME = 'rad';

export interface ExportOptions {
  format?: AnyExportFormat;
  layers: LayerId[];
  layersWithSelection?: LayerId[];
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
