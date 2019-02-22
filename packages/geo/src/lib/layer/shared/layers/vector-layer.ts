import olLayerVector from 'ol/layer/Vector';
import olSourceVector from 'ol/source/Vector';

import { FeatureDataSource } from '../../../datasource/shared/datasources/feature-datasource';
import { WFSDataSource } from '../../../datasource/shared/datasources/wfs-datasource';
import { ArcGISRestDataSource } from '../../../datasource/shared/datasources/arcgisrest-datasource';

import { Layer } from './layer';
import { VectorLayerOptions } from './vector-layer.interface';

export class VectorLayer extends Layer {
  public dataSource: FeatureDataSource | WFSDataSource | ArcGISRestDataSource;
  public options: VectorLayerOptions;
  public ol: olLayerVector;

  constructor(options: VectorLayerOptions) {
    super(options);
  }

  protected createOlLayer(): olLayerVector {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol as olSourceVector
    });

    return new olLayerVector(olOptions);
  }
}
