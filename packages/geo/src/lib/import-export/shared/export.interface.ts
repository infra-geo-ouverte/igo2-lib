import { ExportFormat, EncodingFormat } from './export.type';

export interface ExportOptions {
  format?: ExportFormat;
  encoding?: EncodingFormat;
  layer: string[];
  name?: string;
  featureInMapExtent?: boolean;
}
