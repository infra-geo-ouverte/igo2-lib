import { ExportFormat } from './export.type';

export interface ExportOptions {
  format?: ExportFormat;
  layers: string[];
  layersWithSelection?: string[];
  name?: string;
  featureInMapExtent?: boolean;
}
