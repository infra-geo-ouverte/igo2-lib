import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import stylefunction from 'ol-mapbox-style/dist/stylefunction';
import { AuthInterceptor } from '@igo2/auth';
import { ObjectUtils } from '@igo2/utils';

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
  constructor(
    private http: HttpClient,
    private styleService: StyleService,
    private dataSourceService: DataSourceService,
    @Optional() private authInterceptor: AuthInterceptor
  ) {}

  createLayer(layerOptions: AnyLayerOptions): Layer {
    if (!layerOptions.source) {
      return;
    }

    if (
      layerOptions.source.options &&
      layerOptions.source.options._layerOptionsFromSource
    ) {
      layerOptions = ObjectUtils.mergeDeep(
        layerOptions.source.options._layerOptionsFromSource,
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
    return new ImageLayer(layerOptions, this.authInterceptor);
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
      olLayer = new VectorLayer(layerOptions, this.authInterceptor);
    }

    if (layerOptions.source instanceof ClusterDataSource) {
      const serviceStyle = this.styleService;
      const baseStyle = layerOptions.clusterBaseStyle;
      layerOptions.style = feature => {
        return serviceStyle.createClusterStyle(
          feature,
          layerOptions.clusterParam,
          baseStyle
        );
      };
      olLayer = new VectorLayer(layerOptions, this.authInterceptor);
    }

    const layerOptionsOl = Object.assign({}, layerOptions, {
      style
    });

    if (!olLayer) {
      olLayer = new VectorLayer(layerOptionsOl, this.authInterceptor);
    }

    this.applyMapboxStyle(olLayer, layerOptionsOl as any);

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
      olLayer = new VectorTileLayer(layerOptions, this.authInterceptor);
    }

    const layerOptionsOl = Object.assign({}, layerOptions, {
      style
    });

    if (!olLayer) {
      olLayer = new VectorTileLayer(layerOptionsOl, this.authInterceptor);
    }

    this.applyMapboxStyle(olLayer, layerOptionsOl);
    return olLayer;
  }

  private applyMapboxStyle(layer: Layer, layerOptions: VectorTileLayerOptions) {
    if (layerOptions.mapboxStyle) {
      this.getMapboxGlStyle(layerOptions.mapboxStyle.url).subscribe(res => {
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
