import { Md5 } from 'ts-md5';
import feature from 'ol/Feature';
import olSourceVectorTile from 'ol/source/VectorTile';
import olFormatMVT from 'ol/format/MVT';

import { uuid, SubjectStatus } from '@igo2/utils';

import { DataSource } from './datasource';
import { MVTDataSourceOptions } from './mvt-datasource.interface';

export class MVTDataSource extends DataSource {
  public options: MVTDataSourceOptions;
  public ol: olSourceVectorTile;

  protected createOlSource(): olSourceVectorTile {
    const mvtFormat = new olFormatMVT({featureClass: feature});
    this.options.format = mvtFormat;
    
    return new olSourceVectorTile(this.options);
  }

  protected generateId() {
    if(!this.options.url){
        return uuid();
    }
    const chain = 'mvt' + this.options.url;
    return Md5.hashStr(chain) as string; 
  }
  
  onLayerStatusChange(status: SubjectStatus): void {}
}