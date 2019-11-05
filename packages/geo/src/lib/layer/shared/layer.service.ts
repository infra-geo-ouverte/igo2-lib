import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import stylefunction from 'ol-mapbox-style/stylefunction';
import { ObjectUtils } from '@igo2/utils';
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
  TileArcGISRestDataSource,
  WebSocketDataSource,
  MVTDataSource,
  ClusterDataSource
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
  AnyLayerOptions,
  VectorTileLayer,
  VectorTileLayerOptions
} from './layers';

import { StyleService } from './style.service';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  private tokenKey: string;

  constructor(
    private http: HttpClient,
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
      layerOptions = ObjectUtils.mergeDeep(
        (layerOptions.source.options as any)._layerOptionsFromCapabilities ||
          {},
        layerOptions || {}
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
      case WebSocketDataSource:
      case ClusterDataSource:
        layer = this.createVectorLayer(layerOptions as VectorLayerOptions);
        break;
      case WMSDataSource:
        layer = this.createImageLayer(layerOptions as ImageLayerOptions);
        break;
      case MVTDataSource:
        layer = this.createVectorTileLayer(
          layerOptions as VectorTileLayerOptions
        );
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
          if (source === undefined) {
            return undefined;
          }
          return this.createLayer(Object.assign(layerOptions, { source }));
        })
      );
  }

  private createImageLayer(layerOptions: ImageLayerOptions): ImageLayer {
    if (this.tokenKey) {
      layerOptions.tokenKey = this.tokenKey;
    }

    return new ImageLayer(layerOptions);
  }

  private createTileLayer(layerOptions: TileLayerOptions): TileLayer {
    return new TileLayer(layerOptions);
  }

  private createVectorLayer(layerOptions: VectorLayerOptions): VectorLayer {
    let style;
    let olLayer;
    if (layerOptions.style !== undefined) {
      style = this.styleService.createStyle(layerOptions.style);
    }

    if (layerOptions.source instanceof ArcGISRestDataSource) {
      const source = layerOptions.source as ArcGISRestDataSource;
      style = source.options.params.style;
    } else if (layerOptions.styleByAttribute) {
      const serviceStyle = this.styleService;
      layerOptions.style = feature => {
        return serviceStyle.createStyleByAttribute(
          feature,
          layerOptions.styleByAttribute
        );
      };
      olLayer = new VectorLayer(layerOptions);
    }

    if (layerOptions.source instanceof ClusterDataSource) {
      const serviceStyle = this.styleService;
      const baseStyle = layerOptions.style;
      layerOptions.style = feature => {
        return serviceStyle.createClusterStyle(
          feature,
          layerOptions.clusterParam,
          baseStyle
        );
      };
      olLayer = new VectorLayer(layerOptions);
    }

    const layerOptionsOl = Object.assign({}, layerOptions, {
      style
    });

    if (!olLayer) {
      olLayer = new VectorLayer(layerOptionsOl);
    }

    this.applyMapboxStyle(olLayer, layerOptionsOl);

    return olLayer;
  }

  private createVectorTileLayer(
    layerOptions: VectorTileLayerOptions
  ): VectorTileLayer {
    let style;
    let olLayer;

    if (layerOptions.style !== undefined) {
      style = this.styleService.createStyle(layerOptions.style);
    }

    if (layerOptions.styleByAttribute) {
      const serviceStyle = this.styleService;
      layerOptions.style = feature => {
        return serviceStyle.createStyleByAttribute(
          feature,
          layerOptions.styleByAttribute
        );
      };
      olLayer = new VectorTileLayer(layerOptions);
    }

    const layerOptionsOl = Object.assign({}, layerOptions, {
      style
    });

    if (!olLayer) {
      olLayer = new VectorTileLayer(layerOptionsOl);
    }

    this.applyMapboxStyle(olLayer, layerOptionsOl);
    return olLayer;
  }

  private applyMapboxStyle(layer: Layer, layerOptions: VectorTileLayerOptions) {
    if (layerOptions.mapboxStyle) {
      const mapboxglStyle = this.getMapboxGlStyle(
        layerOptions.mapboxStyle.url
      ).subscribe(res => {
        stylefunction(layer.ol, res, layerOptions.mapboxStyle.source);
      });
    }
  }

  public getMapboxGlStyle(url: string) {
    return this.http.get(url).pipe(
      map((res: any) => res),
      catchError(err => {
        console.log('No style was found');
        return of(err);
      })
    );
  }
}
