import { Injectable, Optional } from '@angular/core';

import { ConfigService } from '@igo2/core';

import {
  OSMDataSource,
  FeatureDataSource,
  XYZDataSource,
  WFSDataSource,
  WMTSDataSource,
  WMSDataSource
} from '../../datasource';

import {
  Layer,
  ImageLayer,
  ImageLayerOptions,
  TileLayer,
  TileLayerOptions,
  VectorLayer,
  VectorLayerOptions,
  AnyLayer,
  AnyLayerOptions
} from './layers';

import { StyleService } from './style.service';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  private tokenKey: string;

  constructor(
    private styleService: StyleService,
    @Optional() private config: ConfigService
  ) {
    if (this.config) {
      this.tokenKey = this.config.getConfig('auth.tokenKey');
    }
  }

  createLayer(layerOptions: AnyLayerOptions): Layer {
    let layer;
    switch (layerOptions.source.constructor) {
      case OSMDataSource:
      case WMTSDataSource:
      case XYZDataSource:
        layer = this.createTileLayer(layerOptions as TileLayerOptions);
        break;
      case FeatureDataSource:
      case WFSDataSource:
        layer = this.createVectorLayer(layerOptions as VectorLayerOptions);
        break;
      case WMSDataSource:
        layer = this.createImageLayer(layerOptions as ImageLayerOptions);
        break;
      default:
        break;
    }

    return layer;
  }

  private createImageLayer(layerOptions: ImageLayerOptions): ImageLayer {
    if (this.tokenKey) {
      layerOptions.token = localStorage.getItem(this.tokenKey);
    }

    return new ImageLayer(layerOptions);
  }

  private createTileLayer(layerOptions: TileLayerOptions): TileLayer {
    return new TileLayer(layerOptions);
  }

  private createVectorLayer(layerOptions: VectorLayerOptions): VectorLayer {
    let style;
    if (layerOptions.style !== undefined) {
      style = this.styleService.createStyle(layerOptions.style);
    }

    const layerOptionsOl = Object.assign({}, layerOptions, {
      style: style
    });

    return new VectorLayer(layerOptionsOl);
  }
}
