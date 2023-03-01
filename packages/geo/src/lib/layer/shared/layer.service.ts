import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {stylefunction} from "ol-mapbox-style";
import { AuthInterceptor } from '@igo2/auth';
import { ObjectUtils } from '@igo2/utils';
import olLayerVectorTile from 'ol/layer/VectorTile';

import { Style } from 'ol/style';

import {
  OSMDataSource,
  FeatureDataSource,
  XYZDataSource,
  TileDebugDataSource,
  WFSDataSource,
  WMTSDataSource,
  WMSDataSource,
  CartoDataSource,
  ImageArcGISRestDataSource,
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

import { computeMVTOptionsOnHover } from '../utils/layer.utils';
import { StyleService } from '../../style/style-service/style.service';
import { LanguageService, MessageService } from '@igo2/core';
import { GeoNetworkService } from '../../offline/shared/geo-network.service';
import { StyleLike as OlStyleLike } from 'ol/style/Style';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  constructor(
    private http: HttpClient,
    private styleService: StyleService,
    private dataSourceService: DataSourceService,
    private geoNetwork: GeoNetworkService,
    private messageService: MessageService,
    private languageService: LanguageService,
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
      case MVTDataSource:
        const _layerOptions = computeMVTOptionsOnHover(layerOptions);
        layer = this.createVectorTileLayer(
          _layerOptions as VectorTileLayerOptions
        );
        break;
      default:
        break;
    }

    return layer;
  }

  createAsyncLayer(_layerOptions: AnyLayerOptions, detailedContextUri?: string): Observable<Layer> {
    const layerOptions = computeMVTOptionsOnHover(_layerOptions);
    if (layerOptions.source) {
      return new Observable(d => d.next(this.createLayer(layerOptions)));
    }

    return this.dataSourceService
      .createAsyncDataSource(layerOptions.sourceOptions, detailedContextUri)
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
    return new ImageLayer(layerOptions, this.messageService, this.languageService, this.authInterceptor);
  }

  private createTileLayer(layerOptions: TileLayerOptions): TileLayer {
    return new TileLayer(layerOptions, this.messageService, this.authInterceptor);
  }

  private createVectorLayer(layerOptions: VectorLayerOptions): VectorLayer {
    let style: Style[] | Style | OlStyleLike;
    let igoLayer: VectorLayer;

    if (!layerOptions.igoStyle) {
      layerOptions.igoStyle = {};
    }
    const legacyStyleOptions = ['styleByAttribute', 'hoverStyle', 'mapboxStyle', 'clusterBaseStyle'];
    // handling legacy property.
    legacyStyleOptions.map(legacyOption => {
      if (layerOptions[legacyOption]) {
        layerOptions.igoStyle[legacyOption] = layerOptions[legacyOption];
        delete layerOptions[legacyOption];
        console.warn(`
        The location of this style option (${legacyOption}) is deprecated.
        Please move this property within igoStyle property.
        Ex: ${legacyOption}: {...} must be transfered to igoStyle: { ${legacyOption}: {...} }
        This legacy conversion will be deleted in 2024.
        `);
      }
    });


    if (layerOptions.style !== undefined) {
      style = (feature, resolution) => this.styleService.createStyle(layerOptions.style, feature, resolution);
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
      igoLayer = new VectorLayer(layerOptions, this.messageService, this.authInterceptor, this.geoNetwork);
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
      igoLayer = new VectorLayer(layerOptions, this.messageService, this.authInterceptor, this.geoNetwork);
    }

    const layerOptionsOl = Object.assign({}, layerOptions, {
      style
    });

    if (!igoLayer) {
      igoLayer = new VectorLayer(layerOptionsOl, this.messageService, this.authInterceptor, this.geoNetwork);
    }

    this.applyMapboxStyle(igoLayer, layerOptionsOl as any);

    return igoLayer;
  }

  private createVectorTileLayer(
    layerOptions: VectorTileLayerOptions
  ): VectorTileLayer {
    let style: Style[] | Style | OlStyleLike;
    let igoLayer: VectorTileLayer;

    if (!layerOptions.igoStyle) {
      layerOptions.igoStyle = {};
    }
    const legacyStyleOptions = ['styleByAttribute', 'hoverStyle', 'mapboxStyle'];
    // handling legacy property.
    legacyStyleOptions.map(legacyOption => {
      if (layerOptions[legacyOption]) {
        layerOptions.igoStyle[legacyOption] = layerOptions[legacyOption];
        delete layerOptions[legacyOption];
        console.warn(`
        The location of this style option (${legacyOption}) is deprecated.
        Please move this property within igoStyle property.
        Ex: ${legacyOption}: {...} must be transfered to igoStyle: { ${legacyOption}: {...} }
        This legacy conversion will be deleted in 2024.
        `);
      }
    });

    if (layerOptions.style !== undefined) {
      style = (feature, resolution) => this.styleService.createStyle(layerOptions.style, feature, resolution);
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
      igoLayer = new VectorTileLayer(layerOptions, this.messageService, this.authInterceptor);
    }

    const layerOptionsOl = Object.assign({}, layerOptions, {
      style
    });

    if (!igoLayer) {
      igoLayer = new VectorTileLayer(layerOptionsOl, this.messageService, this.authInterceptor);
    }

    this.applyMapboxStyle(igoLayer, layerOptionsOl);
    return igoLayer;
  }

  private applyMapboxStyle(layer: Layer, layerOptions: VectorTileLayerOptions) {
    if (layerOptions.igoStyle?.mapboxStyle) {
      this.getStuff(layerOptions.igoStyle.mapboxStyle.url).subscribe(res => {
        if (res.sprite){
          const url = this.getAbsoluteUrl(layerOptions.igoStyle.mapboxStyle.url, res.sprite);
          this.getStuff(url+'.json').subscribe(res2 => {
            stylefunction(layer.ol as olLayerVectorTile, res, layerOptions.igoStyle.mapboxStyle.source, undefined, res2,
              url+'.png');
          });
        } else {
          stylefunction(layer.ol as olLayerVectorTile, res, layerOptions.igoStyle.mapboxStyle.source);
        }
      });
    }
  }

  private getStuff(url: string) {
    return this.http.get(url).pipe(
      map((res: any) => res),
      catchError(err => {
        console.log('No style was found');
        return of(err);
      })
    );
  }

  private getAbsoluteUrl(source, url) {
    const r = new RegExp('^http|\/\/', 'i');
    if(r.test(url)){
      return url;
    } else {
      if ( source.substr(source.length -1) === "/"){
        return source + url;
      } else{
        return source + "/" + url;
      }
    }
  }

}
