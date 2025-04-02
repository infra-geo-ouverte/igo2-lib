import { AnyDataSourceOptions } from '@igo2/geo';

export interface ListExport {
  id: string;
  rank: string;
  layerTitle: string;
  layerGroup: string;
  catalog: string;
  provider: string;
  url: string;
  layerName: string;
  context: string;
  metadataAbstract: string;
  metadataUrl: string;
}

export interface InfoFromSourceOptions {
  id: string;
  layerName: string;
  url: string;
  sourceOptions: AnyDataSourceOptions;
  context: string;
}
