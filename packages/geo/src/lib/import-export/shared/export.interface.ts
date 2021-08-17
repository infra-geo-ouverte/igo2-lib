import { ExportFormat, EncodingFormat } from './export.type';

export interface ExportOptions {
  format?: ExportFormat;
  encoding?: EncodingFormat;
  layers: string[];
  layersWithSelection?: string[];
  name?: string;
  featureInMapExtent?: boolean;
  circlesToPolygons?: boolean;
}
