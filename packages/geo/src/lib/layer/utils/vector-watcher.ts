import { SubjectStatus, Watcher, uuid } from '@igo2/utils';

import { ClusterDataSource } from '../../datasource/shared/datasources/cluster-datasource';
import type { VectorLayer } from '../shared/layers/vector-layer';

export class VectorWatcher extends Watcher {
  private id: string;
  private loaded = 0;
  private loading = 0;
  private onFeatureLoadStart = () => this.handleLoadStart();
  private onFeatureLoadEnd = () => this.handleLoadEnd();

  private layer: VectorLayer;

  constructor(layer: VectorLayer) {
    super();
    this.layer = layer;
    this.id = uuid();
  }

  protected watch() {
    const olSource = this.getWatchableSource();

    if (olSource.getUrl()) {
      olSource.on('featuresloadstart', this.onFeatureLoadStart);
      olSource.on('featuresloadend', this.onFeatureLoadEnd);
      olSource.on('featuresloaderror', this.onFeatureLoadEnd);
    }
  }

  protected unwatch() {
    const olSource = this.getWatchableSource();
    if (olSource.getUrl()) {
      olSource.un('featuresloadstart', this.onFeatureLoadStart);
      olSource.un('featuresloadend', this.onFeatureLoadEnd);
      olSource.un('featuresloaderror', this.onFeatureLoadEnd);
    }
  }

  private getWatchableSource() {
    const source = this.layer.options.source!;

    if (this.layer.dataSource instanceof ClusterDataSource) {
      const clusterOptions = source.options as { source?: typeof source.ol };
      return clusterOptions.source ?? source.ol;
    }

    return source.ol;
  }

  private handleLoadStart() {
    this.loading += 1;
    this.status = SubjectStatus.Working;
  }

  private handleLoadEnd() {
    this.loaded += 1;

    const loading = this.loading;
    if (this.loaded >= loading) {
      if (loading === this.loading) {
        this.status = SubjectStatus.Done;
        this.loaded = this.loading = 0;
      }
    }
  }
}
