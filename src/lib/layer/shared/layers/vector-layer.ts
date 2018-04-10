import * as ol from 'openlayers';

import { DataSource } from '../../../datasource';

import { Layer } from './layer';
import { VectorLayerOptions } from './vector-layer.interface';



export class VectorLayer extends Layer {

  public options: VectorLayerOptions;
  public ol: ol.layer.Vector;

  constructor(dataSource: DataSource, options?: VectorLayerOptions) {
    super(dataSource, options);
  }

  protected createOlLayer(): ol.layer.Vector {
    const olOptions = Object.assign({}, this.options || {}, {
      source: this.dataSource.ol as ol.source.Vector
    });

    return new ol.layer.Vector(olOptions);
  }

}
