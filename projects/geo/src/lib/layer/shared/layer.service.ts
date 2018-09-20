import { Injectable, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from '@igo2/core';

import {
  OSMDataSource,
  FeatureDataSource,
  XYZDataSource,
  WFSDataSource,
  WMTSDataSource,
  WMSDataSource,
  CartoDataSource,
  ArcGISRestDataSource,
  TileArcGISRestDataSource
} from '../../datasource';

import { DataSourceService } from '../../datasource/shared/datasource.service';

import {
  Layer,
  ImageLayer,
  ImageLayerOptions,
  TileLayer,
  TileLayerOptions,
  VectorLayer,
  VectorLayerOptions,
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
    private dataSourceService: DataSourceService,
    @Optional() private config: ConfigService
  ) {
    if (this.config) {
      this.tokenKey = this.config.getConfig('auth.tokenKey');
    }
  }

  createLayer(layerOptions: AnyLayerOptions): Layer {
    if (!layerOptions.source) {
      return;
    }

    if (
      layerOptions.source.options &&
      layerOptions.source.options.optionsFromCapabilities
    ) {
      layerOptions = Object.assign(
        layerOptions,
        (layerOptions.source.options as any)._layerOptionsFromCapabilities
      );
    }

    let layer;
    switch (layerOptions.source.constructor) {
      case OSMDataSource:
      case WMTSDataSource:
      case XYZDataSource:
      case CartoDataSource:
      case TileArcGISRestDataSource:
        layer = this.createTileLayer(layerOptions as TileLayerOptions);
        break;
      case FeatureDataSource:
      case WFSDataSource:
      case ArcGISRestDataSource:
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

  createAsyncLayer(layerOptions: AnyLayerOptions): Observable<Layer> {
    if (layerOptions.source) {
      return new Observable(d => d.next(this.createLayer(layerOptions)));
    }

    return this.dataSourceService
      .createAsyncDataSource(layerOptions.sourceOptions)
      .pipe(
        map(source => {
          layerOptions.source = source;
          return this.createLayer(layerOptions);
        })
      );
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

    if (layerOptions.source instanceof ArcGISRestDataSource) {
      const source = layerOptions.source as ArcGISRestDataSource;
      style = source.options.params.style;
    }

    const layerOptionsOl = Object.assign({}, layerOptions, {
      style: style
    });

    return new VectorLayer(layerOptionsOl);
  }
}
