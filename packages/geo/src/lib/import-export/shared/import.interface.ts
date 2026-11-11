import { ExportFormat } from './export.type';

export interface ImportExportServiceOptions {
  url: string;
  apiKey?: string;
  clientSideFileSizeMaxMb?: number;
  forceNaming?: boolean;
  formats?: ExportFormat[];
  gpxAggregateInComment?: boolean;
  configFileToGeoDBService?: string;
  allowToStoreLayer?: boolean;
}
