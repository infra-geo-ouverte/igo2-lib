import { uuid, Watcher, SubjectStatus } from '@igo2/utils';

import { VectorLayer } from '../shared/layers/vector-layer';
import { ClusterDataSource } from '../../datasource/shared/datasources/cluster-datasource';

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

    olSource.on(`vectorloading`, e => this.handleLoadStart(e));
    olSource.on(`vectorloaded`, e => this.handleLoadEnd(e));
    olSource.on(`vectorloaderror`, e => this.handleLoadEnd(e));

  }

  protected unwatch() {
    let olSource = this.layer.options.source.ol;
    if (this.layer.dataSource instanceof ClusterDataSource) {
      olSource = (this.layer.options.source.options as any).source;
     }
    olSource.un(`vectorloading`, e => this.handleLoadStart(e));
    olSource.un(`vectorloaded`, e => this.handleLoadEnd(e));
    olSource.un(`vectorloaderror`, e => this.handleLoadEnd(e));
  }

  private handleLoadStart(event: any) {
    this.loading += 1;
    this.status = SubjectStatus.Working;
  }

  private handleLoadEnd(event) {
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
