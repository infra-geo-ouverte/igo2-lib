import VectorLayerOL from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { DataSource } from '../../../datasource';

import { Layer } from './layer';
import { VectorLayerOptions } from './vector-layer.interface';

export class VectorLayer extends Layer {
  public options: VectorLayerOptions;
  public ol: VectorLayerOL;

  constructor(options: VectorLayerOptions) {
    super(options);
  }

  protected createOlLayer(): VectorLayerOL {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol as VectorSource
    });

    return new VectorLayerOL(olOptions);
  }
}
