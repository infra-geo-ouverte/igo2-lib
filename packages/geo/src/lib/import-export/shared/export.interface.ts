import { ExportFormat } from './export.type';

export interface ExportOptions {
  format?: ExportFormat;
  layer: string[];
  name?: string;
  featureInMapExtent?: boolean;
}
