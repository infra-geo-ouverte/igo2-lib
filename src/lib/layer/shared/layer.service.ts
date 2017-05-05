import { Injectable } from '@angular/core';

import { DataSource } from '../../datasource';

import { Layer,
         ImageLayer, ImageLayerOptions,
         TileLayer, TileLayerOptions,
         VectorLayer, VectorLayerOptions } from './layers';

export type AnyLayerOptions =
  ImageLayerOptions | TileLayerOptions | VectorLayerOptions;


@Injectable()
export class LayerService {

  constructor() { }

  createLayer(dataSource: DataSource, options: AnyLayerOptions): Layer {
    let layer;
    switch (dataSource.options.type) {
      case 'osm':
      case 'wmts':
      case 'xyz':
        layer = this.createTileLayer(dataSource, options as TileLayerOptions);
        break;
      case 'vector':
      case 'wfs':
        layer = this.createVectorLayer(dataSource, options as VectorLayerOptions);
        break;
      case 'wms':
        layer = this.createImageLayer(dataSource, options as ImageLayerOptions);
        break;
      default:
        break;
    }

    return layer;
  }

  private createImageLayer(
      dataSource: DataSource, options: ImageLayerOptions): ImageLayer {
    return new ImageLayer(dataSource, options);
  }

  private createTileLayer(
      dataSource: DataSource, options: TileLayerOptions): TileLayer {
    return new TileLayer(dataSource, options);
  }

  private createVectorLayer(
      dataSource: DataSource, options: VectorLayerOptions): VectorLayer {
    return new VectorLayer(dataSource, options);
  }
}
