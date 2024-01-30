export interface CsvOutput {
  id: string;
  rank: string;
  layerTitle: string;
  layerGroup: string;
  catalog: string;
  provider: string;
  url: string;
  layerName: string;
  context: string;
  dataDescription: string;
}

export interface InfoFromSourceOptions {
  id: string;
  layerName: string;
  url: string;
  so: unknown;
  context: string;
}
