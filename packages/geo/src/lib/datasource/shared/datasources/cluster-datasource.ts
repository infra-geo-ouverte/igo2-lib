import { uuid } from '@igo2/utils';

import olSourceCluster from 'ol/source/Cluster';

import { ClusterDataSourceOptions } from './cluster-datasource.interface';
import { FeatureDataSource } from './feature-datasource';

export class ClusterDataSource extends FeatureDataSource {
  public declare options: ClusterDataSourceOptions;
  public declare ol: olSourceCluster;

  protected createOlSource(): olSourceCluster {
    this.options.format = this.getSourceFormatFromOptions(this.options);
    this.options.source = super.createOlSource();
    return new olSourceCluster(this.options);
  }

  protected generateId() {
    return uuid();
  }

  public onUnwatch() {
    // empty
  }
}
