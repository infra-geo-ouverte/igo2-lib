import { uuid } from '@igo2/utils';

import feature from 'ol/Feature';
import olFormatMVT from 'ol/format/MVT';
import olSourceVectorTile from 'ol/source/VectorTile';

import { Md5 } from 'ts-md5';

import { DataSource } from './datasource';
import { MVTDataSourceOptions } from './mvt-datasource.interface';

export class MVTDataSource extends DataSource {
  declare public options: MVTDataSourceOptions;
  declare public ol: olSourceVectorTile;

  get saveableOptions(): Partial<MVTDataSourceOptions> {
    return super.saveableOptions;
  }

  protected createOlSource(): olSourceVectorTile {
    let mvtFormat;
    if (this.options.featureClass === 'feature') {
      mvtFormat = new olFormatMVT({ featureClass: feature } as any);
    } else {
      mvtFormat = new olFormatMVT();
    }
    this.options.format = mvtFormat;
    return new olSourceVectorTile(this.options);
  }

  protected generateId() {
    if (!this.options.url) {
      return uuid();
    }
    const chain = 'mvt' + this.options.url;
    return Md5.hashStr(chain) as string;
  }

  public onUnwatch() {
    // empty
  }
}
