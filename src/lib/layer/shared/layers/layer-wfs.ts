import { VectorLayer } from './layer-vector';
import { VectorLayerOptions } from './layer-vector.interface';


export class WFSLayer extends VectorLayer {

  public options: VectorLayerOptions;

  constructor(options: VectorLayerOptions) {
    if (!options.source.formatType) {
      options.source.formatType = 'WFS';
    }

    super(options);
  }
}
