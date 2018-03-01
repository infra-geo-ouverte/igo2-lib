
import { IgoOgcFilterObject } from '../../../filter';
import { DataSourceOptions, DataSourceContext } from './datasource.interface';


export interface WFSDataSourceOptions extends DataSourceOptions, olx.source.VectorOptions {
    version?: string;
    url: string;
    featureTypes: string;
    fieldNameGeometry: string;
    maxFeatures?: Number;
    outputFormat?: string;
    outputFormatDownload?: string;
    srsname?: string;
    filters?: IgoOgcFilterObject;
  }

export interface WFSDataSourceContext extends DataSourceContext, WFSDataSourceOptions {}
