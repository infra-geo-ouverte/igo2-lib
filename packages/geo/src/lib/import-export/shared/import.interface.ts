import { ExportFormat } from './export.type';

export interface ImportExportServiceOptions {
  url: string;
  clientSideFileSizeMaxMb?: number;
  forceNaming?: boolean;
  formats?: ExportFormat[];
  gpxAggregateInComment?: boolean;
  configFileToGeoDBService?: string;
  allowToStoreLayer?: boolean;
  importWithStyle?: boolean;
}
