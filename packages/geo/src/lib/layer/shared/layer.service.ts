import {
  Injectable,
  Injector,
  inject,
  runInInjectionContext
} from '@angular/core';

import { ObjectUtils } from '@igo2/utils';

import { StyleFunction } from 'ol/style/Style';

import { Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';

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
import { clusterOlStyleFunction } from '../../style/shared/style.utils';
import { isLayerGroupOptions } from '../utils/layer.utils';
import {
  AnyLayer,
  AnyLayerItemOptions,
  AnyLayerOptions,
  ImageLayer,
  ImageLayerOptions,
  Layer,
  LayerGroupOptions,
  TileLayer,
  TileLayerOptions,
  VectorLayer,
  VectorLayerOptions,
  VectorTileLayer,
  VectorTileLayerOptions
} from './layers';
import { LayerGroup } from './layers/layer-group';
import {
  OFFLINE_LAYER_RESTORE,
  OfflineLayerRestore
} from './offline-layer-restore.interface';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  private dataSourceService = inject(DataSourceService);
  private injector = inject(Injector);
  private offlineLayerRestore = inject(OFFLINE_LAYER_RESTORE, {
    optional: true
  }) as OfflineLayerRestore | null;

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

    let layer: Layer | undefined;
    switch (layerOptions.source?.constructor) {
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

    return layer!;
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
      .createAsyncDataSource(
        optionsCloned.sourceOptions as any,
        detailedContextUri
      )
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
      return of(this.createGroup([] as AnyLayer[], options));
    }

    return this.createLayers(options.children, detailedContextUri).pipe(
      map((layers) =>
        this.createGroup(layers.filter(Boolean) as AnyLayer[], options)
      )
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
    return runInInjectionContext(
      this.injector,
      () => new ImageLayer(layerOptions)
    );
  }

  private createTileLayer(layerOptions: TileLayerOptions): TileLayer {
    return runInInjectionContext(
      this.injector,
      () => new TileLayer(layerOptions)
    );
  }
  private createVectorLayer(layerOptions: VectorLayerOptions): VectorLayer {
    if (layerOptions.source instanceof ArcGISRestDataSource) {
      const source = layerOptions.source as ArcGISRestDataSource;
      layerOptions.style = source.options.params?.style;
    }

    if (layerOptions.source instanceof ClusterDataSource) {
      layerOptions.style =
        layerOptions.style ?? (clusterOlStyleFunction() as StyleFunction);
    }

    return runInInjectionContext(
      this.injector,
      () => new VectorLayer(layerOptions)
    );
  }

  private createVectorTileLayer(
    layerOptions: VectorTileLayerOptions
  ): VectorTileLayer {
    return runInInjectionContext(
      this.injector,
      () => new VectorTileLayer(layerOptions)
    );
  }

  createAsyncOfflineLayers(contextUri = '*'): Observable<Layer[]> {
    if (!this.offlineLayerRestore) {
      return of([]);
    }

    return this.offlineLayerRestore.createAsyncLayers(contextUri);
  }

  deleteUnavailableLayers(anyLayerOptions: AnyLayerItemOptions) {
    const anyLayerSourceOptions = anyLayerOptions.sourceOptions;
    const index = this.unavailableLayers.findIndex((item) => {
      const baseSourceOptions = item.sourceOptions;
      if (
        this.sourceOptionsWithParams(baseSourceOptions as any) &&
        this.sourceOptionsWithParams(anyLayerSourceOptions as any)
      ) {
        return (
          (baseSourceOptions as any).params.LAYERS ===
          (anyLayerSourceOptions as any).params.LAYERS
        );
      } else if (
        this.sourceOptionsWithLayer(baseSourceOptions as any) &&
        this.sourceOptionsWithLayer(anyLayerSourceOptions as any)
      ) {
        return (
          (baseSourceOptions as any)?.layer ===
          (anyLayerSourceOptions as any)?.layer
        );
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
