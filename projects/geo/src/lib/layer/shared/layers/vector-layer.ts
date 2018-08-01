import VectorLayerOL from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { FeatureDataSource } from '../../../datasource/shared/datasources/feature-datasource';
import { WFSDataSource } from '../../../datasource/shared/datasources/wfs-datasource';

import { Layer } from './layer';
import { VectorLayerOptions } from './vector-layer.interface';

export class VectorLayer extends Layer {
  public dataSource: FeatureDataSource | WFSDataSource;
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
