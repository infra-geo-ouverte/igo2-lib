import { SubjectStatus, Watcher, uuid } from '@igo2/utils';

import { ClusterDataSource } from '../../datasource/shared/datasources/cluster-datasource';
import type { VectorLayer } from '../shared/layers/vector-layer';

export class VectorWatcher extends Watcher {
  private id: string;
  private loaded = 0;
  private loading = 0;

  private layer: VectorLayer;

  constructor(layer: VectorLayer) {
    super();
    this.layer = layer;
    this.id = uuid();
  }

  protected watch() {
    let olSource = this.layer.options.source.ol;
    if (this.layer.dataSource instanceof ClusterDataSource) {
      olSource = (this.layer.options.source.options as any).source;
    }

    if (olSource.getUrl()) {
      olSource.on(`featuresloadstart`, () => this.handleLoadStart());
      olSource.on(`featuresloadend`, () => this.handleLoadEnd());
      olSource.on(`featuresloaderror`, () => this.handleLoadEnd());
    }
  }

  protected unwatch() {
    let olSource = this.layer.options.source.ol;
    if (this.layer.dataSource instanceof ClusterDataSource) {
      olSource = (this.layer.options.source.options as any).source;
    }
    if (olSource.getUrl()) {
      olSource.un(`featuresloadstart`, () => this.handleLoadStart());
      olSource.un(`featuresloadend`, () => this.handleLoadEnd());
      olSource.un(`featuresloaderror`, () => this.handleLoadEnd());
    }
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
