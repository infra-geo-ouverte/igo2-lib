import { ExportFormat } from './export.type';

export interface ExportOptions {
  format?: ExportFormat;
  layers: string[];
  name?: string;
  featureInMapExtent?: boolean;
}
