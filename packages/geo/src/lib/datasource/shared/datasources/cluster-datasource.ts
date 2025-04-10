import { uuid } from '@igo2/utils';

import olSourceCluster from 'ol/source/Cluster';

import { ClusterDataSourceOptions } from './cluster-datasource.interface';
import { FeatureDataSource } from './feature-datasource';

export class ClusterDataSource extends FeatureDataSource {
  declare public options: ClusterDataSourceOptions;
  declare public ol: olSourceCluster;

  get saveableOptions(): Partial<ClusterDataSourceOptions> {
    const baseOptions = super.saveableOptions;
    return {
      ...baseOptions,
      params: this.options.params
    };
  }

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
