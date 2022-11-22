export interface ImportExportServiceOptions {
  url: string;
  clientSideFileSizeMaxMb?: number;
  forceNaming?: boolean;
  formats?: string[];
  configFileToGeoDBService?: string;
}
