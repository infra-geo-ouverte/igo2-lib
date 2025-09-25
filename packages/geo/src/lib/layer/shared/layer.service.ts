import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';

import { AuthInterceptor } from '@igo2/auth';
import { MessageService } from '@igo2/core/message';
import { ObjectUtils } from '@igo2/utils';

import olLayerVectorTile from 'ol/layer/VectorTile';
import { Style } from 'ol/style';
import * as olStyle from 'ol/style';
import { StyleLike as OlStyleLike } from 'ol/style/Style';

import { stylefunction } from 'ol-mapbox-style';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

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
import { StyleService } from '../../style/style-service/style.service';
import {
  computeMVTOptionsOnHover,
  isLayerGroupOptions
} from '../utils/layer.utils';
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
  public unavailableLayers: AnyLayerItemOptions[] = [];

  constructor(
    private http: HttpClient,
    private styleService: StyleService,
    private dataSourceService: DataSourceService,
    private messageService: MessageService,
    @Optional() private geoNetworkService?: GeoNetworkService,
    @Optional() private authInterceptor?: AuthInterceptor
  ) {}

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
        const _layerOptions = computeMVTOptionsOnHover(layerOptions);
        layer = this.createVectorTileLayer(
          _layerOptions as VectorTileLayerOptions
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

    computeMVTOptionsOnHover(optionsCloned);
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
    let style: Style[] | Style | OlStyleLike = layerOptions.style;
    let igoLayer: VectorLayer;

    if (!layerOptions.igoStyle) {
      layerOptions.igoStyle = {};
    }
    const legacyStyleOptions = [
      'styleByAttribute',
      'hoverStyle',
      'mapboxStyle',
      'clusterBaseStyle',
      'style'
    ];
    // handling legacy property.
    this.handleLegacyStyles(layerOptions, legacyStyleOptions);
    if (
      layerOptions.igoStyle.igoStyleObject &&
      !layerOptions.idbInfo?.storeToIdb
    ) {
      style = (feature, resolution) =>
        this.styleService.createStyle(
          layerOptions.igoStyle.igoStyleObject,
          feature,
          resolution
        );
    } else if (
      layerOptions.igoStyle.igoStyleObject &&
      layerOptions.idbInfo?.storeToIdb
    ) {
      style = this.styleService.parseStyle(
        'style',
        layerOptions.igoStyle.igoStyleObject
      );
    }

    if (layerOptions.source instanceof ArcGISRestDataSource) {
      const source = layerOptions.source as ArcGISRestDataSource;
      style = source.options.params.style;
    } else if (layerOptions.igoStyle?.styleByAttribute) {
      const serviceStyle = this.styleService;
      layerOptions.style = (feature, resolution) => {
        return serviceStyle.createStyleByAttribute(
          feature,
          layerOptions.igoStyle.styleByAttribute,
          resolution
        );
      };

      igoLayer = new VectorLayer(
        layerOptions,
        this.messageService,
        this.authInterceptor,
        this.geoNetworkService
      );
    }

    if (layerOptions.source instanceof ClusterDataSource) {
      const serviceStyle = this.styleService;
      const baseStyle = layerOptions.igoStyle.clusterBaseStyle;
      layerOptions.style = (feature, resolution) => {
        return serviceStyle.createClusterStyle(
          feature,
          resolution,
          layerOptions.clusterParam,
          baseStyle
        );
      };

      igoLayer = new VectorLayer(
        layerOptions,
        this.messageService,
        this.authInterceptor,
        this.geoNetworkService
      );
    }

    const layerOptionsOl = Object.assign({}, layerOptions, {
      style
    });

    if (!igoLayer) {
      igoLayer = new VectorLayer(
        layerOptionsOl,
        this.messageService,
        this.authInterceptor,
        this.geoNetworkService
      );
    }

    this.applyMapboxStyle(igoLayer, layerOptionsOl as any);

    return igoLayer;
  }

  private handleLegacyStyles(layerOptions, legacyStyleOptions: string[]) {
    legacyStyleOptions.map((legacyOption) => {
      if (layerOptions[legacyOption]) {
        let newKey = legacyOption;
        if (legacyOption === 'style') {
          if (layerOptions[legacyOption] instanceof olStyle.Style) {
            return;
          }
          if (typeof layerOptions[legacyOption] === 'object') {
            newKey = 'igoStyleObject';
          } else {
            return;
          }
        }
        layerOptions.igoStyle[newKey] = layerOptions[legacyOption];
        delete layerOptions[legacyOption];
        console.warn(`
        The location of this style option (${legacyOption}) is deprecated.
        Please move this property within igoStyle property.
        Ex: ${legacyOption}: {...} must be transfered to igoStyle: { ${newKey}: {...} }
        This legacy conversion will be deleted in 2024.
        `);
      }
    });
  }

  private createVectorTileLayer(
    layerOptions: VectorTileLayerOptions
  ): VectorTileLayer {
    let style: Style[] | Style | OlStyleLike;
    let igoLayer: VectorTileLayer;

    if (!layerOptions.igoStyle) {
      layerOptions.igoStyle = {};
    }
    const legacyStyleOptions = [
      'styleByAttribute',
      'hoverStyle',
      'mapboxStyle',
      'style'
    ];
    // handling legacy property.
    this.handleLegacyStyles(layerOptions, legacyStyleOptions);

    if (layerOptions.igoStyle.igoStyleObject) {
      style = (feature, resolution) =>
        this.styleService.createStyle(
          layerOptions.igoStyle.igoStyleObject,
          feature,
          resolution
        );
    }

    if (layerOptions.igoStyle.styleByAttribute) {
      const serviceStyle = this.styleService;
      layerOptions.style = (feature, resolution) => {
        return serviceStyle.createStyleByAttribute(
          feature,
          layerOptions.igoStyle.styleByAttribute,
          resolution
        );
      };
      igoLayer = new VectorTileLayer(
        layerOptions,
        this.messageService,
        this.authInterceptor
      );
    }

    const layerOptionsOl = Object.assign({}, layerOptions, {
      style
    });

    if (!igoLayer) {
      igoLayer = new VectorTileLayer(
        layerOptionsOl,
        this.messageService,
        this.authInterceptor
      );
    }

    this.applyMapboxStyle(igoLayer, layerOptionsOl);
    return igoLayer;
  }

  private applyMapboxStyle(layer: Layer, layerOptions: VectorTileLayerOptions) {
    if (layerOptions.igoStyle?.mapboxStyle) {
      this.getStuff(layerOptions.igoStyle.mapboxStyle.url).subscribe((res) => {
        if (res.sprite) {
          const url = this.getAbsoluteUrl(
            layerOptions.igoStyle.mapboxStyle.url,
            res.sprite
          );
          this.getStuff(url + '.json').subscribe((res2) => {
            stylefunction(
              layer.ol as olLayerVectorTile,
              res,
              layerOptions.igoStyle.mapboxStyle.source,
              undefined,
              res2,
              url + '.png'
            );
          });
        } else {
          stylefunction(
            layer.ol as olLayerVectorTile,
            res,
            layerOptions.igoStyle.mapboxStyle.source
          );
        }
      });
    }
  }

  private getStuff(url: string) {
    return this.http.get(url).pipe(
      map((res: any) => res),
      catchError((err) => {
        console.log('No style was found');
        return of(err);
      })
    );
  }

  private getAbsoluteUrl(source, url) {
    const r = new RegExp('^http|//', 'i');
    if (r.test(url)) {
      return url;
    } else {
      if (source.substr(source.length - 1) === '/') {
        return source + url;
      } else {
        return source + '/' + url;
      }
    }
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
