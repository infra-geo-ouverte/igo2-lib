import olSourceVector from 'ol/source/Vector';
import { uuid, Watcher, SubjectStatus } from '@igo2/utils';

import { VectorLayer } from '../shared/layers/vector-layer';

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
  }

  protected unwatch() {
    this.layer.onUnwatch();
  }
}
