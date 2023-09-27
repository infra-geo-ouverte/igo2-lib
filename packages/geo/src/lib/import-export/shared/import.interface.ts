import { ExportFormat } from './export.type';

export interface ImportExportServiceOptions {
  url: string;
  clientSideFileSizeMaxMb?: number;
  forceNaming?: boolean;
  formats?: ExportFormat[];
  configFileToGeoDBService?: string;
  allowToStoreLayer?: boolean;
  importWithStyle?: boolean;
}
