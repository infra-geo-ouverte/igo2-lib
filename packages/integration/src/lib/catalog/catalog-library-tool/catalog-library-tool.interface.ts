import { AnyDataSourceOptions, LayerId } from '@igo2/geo';

export interface ListExport {
  id: LayerId;
  rank: string;
  layerTitle: string;
  layerGroup: string;
  catalog: string;
  provider: string;
  url: string | undefined;
  layerName: string | undefined;
  context: string;
  metadataAbstract: string;
  metadataUrl: string | undefined;
}

export interface InfoFromSourceOptions {
  id: LayerId;
  layerName?: string;
  url?: string;
  sourceOptions?: AnyDataSourceOptions;
  context: string;
}
