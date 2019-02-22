import { ExportFormat } from './import-export.type';

export interface ExportOptions {
  format: ExportFormat;
  layer: string;
}

export interface ImportExportServiceOptions {
  url: string;
}
