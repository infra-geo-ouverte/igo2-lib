import { Injectable, inject } from '@angular/core';

import { AuthInterceptor } from '@igo2/auth';
import { MessageService } from '@igo2/core/message';
import { ObjectUtils } from '@igo2/utils';

import { Observable, combineLatest, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { DataSourceService } from '../../datasource/shared/datasource.service';
import {
  AnyDataSourceOptions,
  AnyDataSourceOptionsWithParams,
  ArcGISRestDataSource,
  ArcGISRestDataSourceOptions,
  CartoDataSource,
  ClusterDataSource,
  FeatureDataSource,
  ImageArcGISRestDataSource,
  MVTDataSource,
  OSMDataSource,
  TileArcGISRestDataSource,
  TileDebugDataSource,
  WFSDataSource,
  WMSDataSource,
  WMTSDataSource,
  WMTSDataSourceOptions,
  WebSocketDataSource,
  XYZDataSource
} from '../../datasource/shared/datasources';
import { LayerDB } from '../../offline/layerDB/layerDB';
import { GeoNetworkService } from '../../offline/shared/geo-network.service';
import { GeostylerService } from '../../style/geostyler/geostyler.service';
import { LayerClusterOlStyleFunction } from '../../style/shared/layer/layer-style.utils';
import { isLayerGroupOptions } from '../utils/layer.utils';
import {
  AnyLayer,
  AnyLayerItemOptions,
  AnyLayerOptions,
  ImageLayer,
  ImageLayerOptions,
  Layer,
  LayerGroupOptions,
  LayerOptions,
  TileLayer,
  TileLayerOptions,
  VectorLayer,
  VectorLayerOptions,
  VectorTileLayer,
  VectorTileLayerOptions
} from './layers';
import { LayerGroup } from './layers/layer-group';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  private dataSourceService = inject(DataSourceService);
  private messageService = inject(MessageService);
  private geoNetworkService = inject(GeoNetworkService, { optional: true });
  private authInterceptor = inject(AuthInterceptor, { optional: true });
  private geostylerService = inject(GeostylerService, { optional: true });

  public unavailableLayers: AnyLayerItemOptions[] = [];

  createLayers(
    layersOption: AnyLayerOptions[],
    contextUri?: string
  ): Observable<(AnyLayer | undefined)[]> {
    const arrayObsLayers = layersOption.map((option) => {
      return isLayerGroupOptions(option)
        ? this.createAsyncGroup(option)
        : this.createAsyncLayer(option, contextUri);
    });

    return combineLatest(arrayObsLayers);
  }

  createLayer(layerOptions: AnyLayerItemOptions): Layer {
    if (layerOptions.source?.options?._layerOptionsFromSource) {
      layerOptions = ObjectUtils.mergeDeep(
        layerOptions.source.options._layerOptionsFromSource,
        layerOptions || {}
      );
    }

    let layer: Layer;
    switch (layerOptions.source.constructor) {
      case OSMDataSource:
      case WMTSDataSource:
      case XYZDataSource:
      case TileDebugDataSource:
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
      case ImageArcGISRestDataSource:
      case WMSDataSource:
        layer = this.createImageLayer(layerOptions as ImageLayerOptions);
        break;
      case MVTDataSource: {
        layer = this.createVectorTileLayer(
          layerOptions as VectorTileLayerOptions
        );
        break;
      }
      default:
        break;
    }

    return layer;
  }

  createAsyncLayer(
    options: AnyLayerItemOptions,
    detailedContextUri?: string
  ): Observable<Layer | undefined> {
    const optionsCloned = { ...options };

    if (optionsCloned.source) {
      return new Observable((d) => d.next(this.createLayer(optionsCloned)));
    }

    return this.dataSourceService
      .createAsyncDataSource(optionsCloned.sourceOptions, detailedContextUri)
      .pipe(
        map((source) => {
          if (source === undefined) {
            const found = this.unavailableLayers.some(
              (el) => el === optionsCloned
            );
            if (!found) {
              this.unavailableLayers.push(optionsCloned);
            }

            return undefined;
          }
          return this.createLayer(Object.assign(optionsCloned, { source }));
        })
      );
  }

  createAsyncGroup(
    options: LayerGroupOptions,
    detailedContextUri?: string
  ): Observable<LayerGroup> {
    if (!options.children?.length) {
      return of(this.createGroup(null, options));
    }

    return this.createLayers(options.children, detailedContextUri).pipe(
      map((layers) => this.createGroup(layers.filter(Boolean), options))
    );
  }

  private createGroup(
    layers: AnyLayer[],
    options: LayerGroupOptions
  ): LayerGroup {
    const group = new LayerGroup(layers, options);
    return group;
  }

  private createImageLayer(layerOptions: ImageLayerOptions): ImageLayer {
    return new ImageLayer(
      layerOptions,
      this.messageService,
      this.authInterceptor
    );
  }

  private createTileLayer(layerOptions: TileLayerOptions): TileLayer {
    return new TileLayer(
      layerOptions,
      this.messageService,
      this.authInterceptor
    );
  }
  private createVectorLayer(layerOptions: VectorLayerOptions): VectorLayer {
    if (layerOptions.source instanceof ArcGISRestDataSource) {
      const source = layerOptions.source as ArcGISRestDataSource;
      layerOptions.style = source.options.params.style;
    }
    if (layerOptions.source instanceof ClusterDataSource) {
      layerOptions.style = (feature) => {
        return LayerClusterOlStyleFunction(feature, layerOptions.clusterParam);
      };
    }
    return new VectorLayer(
      layerOptions,
      this.messageService,
      this.authInterceptor,
      this.geoNetworkService,
      this.geostylerService
    );
  }

  private createVectorTileLayer(
    layerOptions: VectorTileLayerOptions
  ): VectorTileLayer {
    return new VectorTileLayer(
      layerOptions,
      this.messageService,
      this.authInterceptor,
      this.geostylerService
    );
  }

  createAsyncIdbLayers(contextUri = '*'): Observable<Layer[]> {
    const layerDB = new LayerDB();
    return layerDB.getAll().pipe(
      concatMap((res) => {
        const idbLayers =
          contextUri !== '*'
            ? res.filter((l) => l.detailedContextUri === contextUri)
            : res;
        const layersOptions: LayerOptions[] = idbLayers.map((idbl) =>
          Object.assign({}, idbl.layerOptions, {
            sourceOptions: idbl.sourceOptions
          })
        );
        return combineLatest(
          layersOptions.map((layerOptions) =>
            this.createAsyncLayer(layerOptions)
          )
        );
      })
    );
  }

  deleteUnavailableLayers(anyLayerOptions: AnyLayerItemOptions) {
    const anyLayerSourceOptions = anyLayerOptions.sourceOptions;
    const index = this.unavailableLayers.findIndex((item) => {
      const baseSourceOptions = item.sourceOptions;
      if (
        this.sourceOptionsWithParams(baseSourceOptions) &&
        this.sourceOptionsWithParams(anyLayerSourceOptions)
      ) {
        return (
          baseSourceOptions.params.LAYERS ===
          anyLayerSourceOptions.params.LAYERS
        );
      } else if (
        this.sourceOptionsWithLayer(baseSourceOptions) &&
        this.sourceOptionsWithLayer(anyLayerSourceOptions)
      ) {
        return baseSourceOptions.layer === anyLayerSourceOptions.layer;
      }
    });
    this.unavailableLayers.splice(index, index >= 0 ? 1 : 0);
  }

  sourceOptionsWithParams(
    sourceOptions: AnyDataSourceOptions
  ): sourceOptions is AnyDataSourceOptionsWithParams {
    return 'params' in sourceOptions;
  }

  sourceOptionsWithLayer(
    sourceOptions: AnyDataSourceOptions
  ): sourceOptions is ArcGISRestDataSourceOptions | WMTSDataSourceOptions {
    return 'layer' in sourceOptions;
  }
}
