import { AuthInterceptor } from '@igo2/auth';
import { MessageService } from '@igo2/core/message';
import { ObjectUtils } from '@igo2/utils';

import OlFeature from 'ol/Feature';
import { unByKey } from 'ol/Observable';
import { asArray as ColorAsArray } from 'ol/color';
import { easeOut } from 'ol/easing';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import { FeatureLoader } from 'ol/featureloader';
import * as olformat from 'ol/format';
import { ReadOptions } from 'ol/format/Feature';
import olLayerVector from 'ol/layer/Vector';
import * as olproj from 'ol/proj';
import olProjection from 'ol/proj/Projection';
import { getVectorContext } from 'ol/render';
import olSourceVector from 'ol/source/Vector';

import { fromEvent, of, zip } from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  delay,
  first
} from 'rxjs/operators';

import { ArcGISRestDataSource } from '../../../datasource/shared/datasources/arcgisrest-datasource';
import { ClusterDataSource } from '../../../datasource/shared/datasources/cluster-datasource';
import { FeatureDataSource } from '../../../datasource/shared/datasources/feature-datasource';
import { FeatureDataSourceOptions } from '../../../datasource/shared/datasources/feature-datasource.interface';
import { WebSocketDataSource } from '../../../datasource/shared/datasources/websocket-datasource';
import { WFSDataSource } from '../../../datasource/shared/datasources/wfs-datasource';
import {
  WFSDataSourceOptions,
  WFSDataSourceOptionsParams
} from '../../../datasource/shared/datasources/wfs-datasource.interface';
import {
  buildUrl,
  defaultMaxFeatures
} from '../../../datasource/shared/datasources/wms-wfs.utils';
import type { MapBase, MapExtent } from '../../../map/shared';
import { getResolutionFromScale } from '../../../map/shared/map.utils';
import { InsertSourceInsertDBEnum } from '../../../offline/geoDB/geoDB.enums';
import { GeoDBService } from '../../../offline/geoDB/geoDB.service';
import { LayerDBData } from '../../../offline/layerDB/layerDB.interface';
import { LayerDBService } from '../../../offline/layerDB/layerDB.service';
import {
  GeoNetworkService,
  SimpleGetOptions
} from '../../../offline/shared/geo-network.service';
import { olStyleToBasicIgoStyle } from '../../../style/shared/vector/conversion.utils';
import { VectorWatcher } from '../../utils/vector-watcher';
import { Layer } from './layer';
import { LayerType } from './layer.interface';
import type { VectorLayerOptions } from './vector-layer.interface';

interface VectorRequest {
  xhr: XMLHttpRequest | undefined;
  extent: Extent;
  resolution: number;
}

export class VectorLayer extends Layer {
  type: LayerType = 'vector';

  private lastRequest: VectorRequest;
  private ongoingRequests: VectorRequest[] = [];
  declare public dataSource:
    | FeatureDataSource
    | WFSDataSource
    | ArcGISRestDataSource
    | WebSocketDataSource
    | ClusterDataSource;
  declare public options: VectorLayerOptions;
  declare public ol: olLayerVector<olSourceVector>;
  private watcher: VectorWatcher;
  private trackFeatureListenerId;

  get browsable(): boolean {
    return this.options.browsable !== false;
  }

  get exportable(): boolean {
    return this.options.exportable !== false;
  }

  constructor(
    options: VectorLayerOptions,
    public messageService?: MessageService,
    public authInterceptor?: AuthInterceptor,
    private geoNetworkService?: GeoNetworkService,
    public geoDBService?: GeoDBService,
    public layerDBService?: LayerDBService
  ) {
    super(options, messageService, authInterceptor);
    this.watcher = new VectorWatcher(this);
    this.status$ = this.watcher.status$;
  }

  protected createOlLayer(): olLayerVector<olSourceVector> {
    const initialOpacityValue = this.options.opacity || 1;
    const initialVisibleValue = this.options.visible !== false;
    const initialMinResValue =
      this.options.minResolution ||
      getResolutionFromScale(Number(this.options.minScaleDenom));
    const initialMaxResValue =
      this.options.maxResolution ||
      getResolutionFromScale(Number(this.options.maxScaleDenom));
    const so = this.options.sourceOptions as FeatureDataSourceOptions;
    if (this.dataSource instanceof FeatureDataSource) {
      if (so?.preload?.bypassResolution || so?.preload?.bypassVisible) {
        this.options.opacity = 0;
        if (
          so.preload.bypassResolution &&
          (this.options.minResolution || this.options.maxResolution)
        ) {
          this.options.minResolution = 0;
          this.options.maxResolution = Infinity;
        }
        if (so.preload.bypassVisible && !initialVisibleValue) {
          this.options.visible = true;
        }
      }
    }

    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol as olSourceVector,
      sourceOptions: this.options.sourceOptions || this.options.source.options
    });

    if (this.options.animation) {
      this.dataSource.ol.on(
        'addfeature',
        function (e) {
          this.flash(e.feature);
        }.bind(this)
      );
    }
    if (this.options.idbInfo?.storeToIdb && this.geoDBService) {
      if (this.options.idbInfo.firstLoad) {
        this.maintainFeaturesInIdb();
      }
      this.dataSource.ol.once('featuresloadend', () => {
        this.dataSource.ol.on('addfeature', () => this.maintainFeaturesInIdb());
        this.dataSource.ol.on('changefeature', () =>
          this.maintainFeaturesInIdb()
        );
        this.dataSource.ol.on('clear', () => this.maintainFeaturesInIdb());
        this.dataSource.ol.on('removefeature', () =>
          this.maintainFeaturesInIdb()
        );
      });
    }

    if (
      this.dataSource instanceof FeatureDataSource &&
      (so?.preload?.bypassResolution || so?.preload?.bypassVisible)
    ) {
      this.dataSource.ol.once('featuresloadend', () => {
        if (initialOpacityValue) {
          this.opacity = initialOpacityValue;
        }
        if (so.preload.bypassResolution) {
          this.minResolution = initialMinResValue;
          this.maxResolution = initialMaxResValue;
        }
        if (so.preload.bypassVisible) {
          this.visible = initialVisibleValue;
        }
      });
    }

    if (this.options.trackFeature) {
      this.enableTrackFeature(this.options.trackFeature);
    }

    const vector = new olLayerVector(olOptions);
    const vectorSource = vector.getSource() as olSourceVector;
    const url = vectorSource.getUrl();
    if (typeof url === 'function') {
      return vector;
    }
    if (url || olOptions.sourceOptions?.type === 'wfs') {
      let loader: FeatureLoader;
      const wfsOptions = olOptions.sourceOptions as WFSDataSourceOptions;
      if (
        wfsOptions?.type === 'wfs' &&
        (wfsOptions.params || wfsOptions.paramsWFS)
      ) {
        loader = (extent, resolution, proj, success, failure) => {
          this.customWFSLoader(
            vectorSource,
            wfsOptions,
            extent,
            resolution,
            proj,
            success,
            failure
          );
        };
      } else {
        loader = (extent, _resolution, proj, success, failure) => {
          this.customLoader(vectorSource, url, extent, proj, success, failure);
        };
      }
      if (loader) {
        vectorSource.setLoader(loader);
      }
    } else if (this.options.idbInfo?.storeToIdb && this.geoDBService) {
      const idbLoader = (extent, _resolution, proj, success, failure) => {
        this.customIDBLoader(
          vectorSource,
          olOptions.id,
          extent,
          proj,
          success,
          failure
        );
      };
      if (idbLoader) {
        vectorSource.setLoader(idbLoader);
      }
    }

    if (this.options.idbInfo?.storeToIdb && this.geoDBService) {
      vector.once('sourceready', () => {
        if (this.options.idbInfo.firstLoad) {
          this.maintainOptionsInIdb();
        }
        fromEvent<BaseEvent>(vector, 'change')
          .pipe(debounceTime(750))
          .subscribe(() => this.maintainOptionsInIdb());
        vector.on('change:zIndex', () => this.maintainOptionsInIdb());
      });
    }
    return vector;
  }

  remove(): void {
    this.watcher.unsubscribe();
    this.removeLayerFromIDB();
    super.remove();
  }

  private removeLayerFromIDB() {
    if (this.geoDBService && this.layerDBService) {
      zip(
        this.geoDBService.deleteByKey(this.id),
        this.layerDBService.deleteByKey(this.id)
      ).subscribe();
    }
  }

  private maintainOptionsInIdb() {
    this.options.igoStyle.igoStyleObject = olStyleToBasicIgoStyle(this.ol);
    const layerData: LayerDBData = ObjectUtils.removeUndefined({
      layerId: this.id,
      detailedContextUri: this.options.idbInfo.contextUri,
      sourceOptions: {
        id: this.id,
        type: 'vector',
        queryable: true
      },
      layerOptions: {
        workspace: this.options.workspace,
        zIndex: this.ol ? this.zIndex : 1000000,
        id: this.id,
        isIgoInternalLayer: this.isIgoInternalLayer,
        title: this.title,
        igoStyle: this.options.igoStyle,
        idbInfo: Object.assign({}, this.options.idbInfo, { firstLoad: false })
      },
      insertEvent: `${this.title}-${this.id}-${new Date()}`
    });
    this.layerDBService.update(layerData);
  }

  private maintainFeaturesInIdb() {
    const dsFeatures = this.dataSource.ol.getFeatures();
    const geojsonObject = JSON.parse(
      new olformat.GeoJSON().writeFeatures(dsFeatures, {
        dataProjection: 'EPSG:4326',
        featureProjection: this.dataSource.ol.getProjection() || 'EPSG:3857'
      })
    );
    this.geoDBService.update(
      this.id,
      this.id,
      geojsonObject,
      InsertSourceInsertDBEnum.User,
      `${this.title}-${this.id}-${new Date()}`
    );
  }

  protected flash(feature: OlFeature) {
    const start = new Date().getTime();
    const listenerKey = this.ol.on('postrender', animate.bind(this));

    function animate(event) {
      const vectorContext = getVectorContext(event);
      const frameState = event.frameState;
      const flashGeom = feature.getGeometry().clone();
      const elapsed = frameState.time - start;
      const elapsedRatio = elapsed / this.options.animation.duration;
      const opacity = easeOut(1 - elapsedRatio);
      const newColor = ColorAsArray(this.options.animation.color || 'red');
      newColor[3] = opacity;
      let style = this.ol
        .getStyleFunction()
        .call(this, feature)
        .find((style2) => {
          return style2.getImage();
        });
      if (!style) {
        style = this.ol.getStyleFunction().call(this, feature)[0];
      }
      const styleClone = style.clone();

      switch (feature.getGeometry().getType()) {
        case 'Point':
          if (
            styleClone.getImage() !== null &&
            typeof styleClone.getImage().getRadius === 'function'
          ) {
            const radius =
              easeOut(elapsedRatio) * (styleClone.getImage().getRadius() * 3);
            styleClone.getImage().setRadius(radius);
            styleClone.getImage().setOpacity(opacity);
          }

          break;
        case 'LineString':
          // TODO
          if (styleClone.getImage()) {
            styleClone.getImage().getStroke().setColor(newColor);
            styleClone
              .getImage()
              .getStroke()
              .setWidth(
                easeOut(elapsedRatio) *
                  (styleClone.getImage().getStroke().getWidth() * 3)
              );
          }
          if (styleClone.getStroke()) {
            styleClone.getStroke().setColor(newColor);
            styleClone
              .getStroke()
              .setWidth(
                easeOut(elapsedRatio) * (styleClone.getStroke().getWidth() * 3)
              );
          }
          break;
        case 'Polygon':
          // TODO
          if (styleClone.getImage()) {
            styleClone.getImage().getFill().setColor(newColor);
          }
          if (styleClone.getFill()) {
            styleClone.getFill().setColor(newColor);
          }
          break;
      }

      styleClone.setText('');
      vectorContext.setStyle(styleClone);
      vectorContext.drawGeometry(flashGeom);

      if (elapsed > this.options.animation.duration) {
        unByKey(listenerKey);
        // remove last geometry
        // there is a little flash before feature disappear, better solution ?
        this.map.ol.render();
        return;
      }
      // tell OpenLayers to continue postcompose animation
      this.map.ol.render();
    }
  }

  public init(map: MapBase | undefined) {
    if (map === undefined) {
      this.watcher.unsubscribe();
    } else {
      this.watcher.subscribe(() => void 0);
    }
    super.init(map);
  }

  public setExtent(extent: MapExtent): void {
    this.options.extent = extent;
  }

  public onUnwatch() {
    this.dataSource.onUnwatch();
    this.stopAnimation();
  }

  public stopAnimation() {
    this.dataSource.ol.un(
      'addfeature',
      function (e) {
        if (this.visible) {
          this.flash(e.feature);
        }
      }.bind(this)
    );
  }

  public enableTrackFeature(id: string | number): void {
    this.trackFeatureListenerId = this.dataSource.ol.on(
      'addfeature',
      this.trackFeature.bind(this, id)
    );
  }

  public centerMapOnFeature(id: string | number) {
    const feat = this.dataSource.ol.getFeatureById(id);
    if (feat) {
      this.map.ol
        .getView()
        .setCenter((feat.getGeometry() as any).getCoordinates());
    }
  }

  public trackFeature(id: string | number, feat: { feature: OlFeature }) {
    if (feat.feature.getId() === id && this.visible) {
      this.centerMapOnFeature(id);
    }
  }

  public disableTrackFeature() {
    unByKey(this.trackFeatureListenerId);
  }

  /**
   * Custom loader for a WFS datasource
   * @internal
   * @param vectorSource the vector source to be created
   * @param options olOptions from source
   * @param extent the extent of the requested data
   * @param resolution the current resolution
   * @param proj the projection to retrieve the data
   * @param success success callback
   * @param failure failure callback
   * @param randomParam random parameter to ensure cache is not causing problems in retrieving new data
   */
  public customWFSLoader(
    vectorSource: olSourceVector,
    options: WFSDataSourceOptions,
    extent: Extent,
    resolution: number,
    proj: olProjection,
    success: (features: OlFeature[]) => void,
    failure: () => void,
    randomParam?: boolean
  ) {
    const paramsWFS = options.paramsWFS;
    const wfsProj = this.getProjection(proj, paramsWFS);
    const currentExtent = olproj.transformExtent(extent, proj, wfsProj);

    if (
      this.lastRequest &&
      (this.lastRequest.extent !== currentExtent ||
        this.lastRequest.resolution !== resolution)
    ) {
      this.abortRequests(vectorSource);
    }

    const properties = this.dataSource.ol.getProperties();
    const url = buildUrl(
      { ...options, ...properties },
      currentExtent,
      wfsProj,
      randomParam
    );

    const request: VectorRequest = {
      xhr: undefined,
      extent,
      resolution
    };

    const readOptions: ReadOptions = {
      dataProjection: wfsProj,
      featureProjection: proj
    };

    if (
      paramsWFS.version === '2.0.0' &&
      paramsWFS.maxFeatures > defaultMaxFeatures
    ) {
      this.batchGetFeatures(
        url,
        request,
        vectorSource,
        paramsWFS,
        readOptions,
        success,
        failure
      );
    } else {
      this.getFeatures(
        url,
        request,
        vectorSource,
        readOptions,
        success,
        failure
      );
    }
  }

  private abortRequests(vectorSource: olSourceVector): void {
    vectorSource.removeLoadedExtent(this.lastRequest.extent);
    for (const request of this.ongoingRequests) {
      request.xhr?.abort();
      this.removeRequest(request);
    }
  }

  private getProjection(
    proj: olProjection,
    params: WFSDataSourceOptionsParams
  ) {
    const newProj = params.srsName
      ? new olProjection({ code: params.srsName })
      : proj;

    params.srsName = newProj.getCode();

    return newProj;
  }

  private batchGetFeatures(
    url: string,
    request: VectorRequest,
    vectorSource: olSourceVector,
    paramsWFS: WFSDataSourceOptionsParams,
    readOptions: ReadOptions,
    success: (features: OlFeature[]) => void,
    failure: () => void
  ) {
    const nbOfFeature = 1000;
    let startIndex = 0;
    while (startIndex < paramsWFS.maxFeatures) {
      let alteredUrl = url.replace(
        'count=' + paramsWFS.maxFeatures,
        'count=' + nbOfFeature
      );
      alteredUrl = alteredUrl.replace('startIndex=0', '0');
      alteredUrl += '&startIndex=' + startIndex;
      alteredUrl.replace(/&&/g, '&');

      this.getFeatures(
        alteredUrl,
        request,
        vectorSource,
        readOptions,
        success,
        failure
      );
      startIndex += nbOfFeature;
    }
  }

  /**
   * Custom loader to get feature from a WFS datasource
   * @internal
   * @param vectorSource the vector source to be created
   * @param extent the extent of the requested data
   * @param dataProjection the projection of the retrieved data
   * @param featureProjection the projection of the created features
   * @param url the url string to retrieve the data
   * @param success success callback
   * @param failure failure callback
   */
  private getFeatures(
    url: string,
    request: VectorRequest,
    vectorSource: olSourceVector,
    readOptions: ReadOptions,
    success: (features: OlFeature[]) => void,
    failure: () => void
  ): void {
    const xhr = new XMLHttpRequest();
    const alteredUrlWithKeyAuth = this.authInterceptor.alterUrlWithKeyAuth(url);
    let modifiedUrl = url;
    if (alteredUrlWithKeyAuth) {
      modifiedUrl = alteredUrlWithKeyAuth;
    }

    xhr.open('GET', modifiedUrl);
    if (this.authInterceptor) {
      this.authInterceptor.interceptXhr(xhr, modifiedUrl);
    }

    const onError = () => {
      vectorSource.removeLoadedExtent(request.extent);
      this.removeRequest(request);
      failure();
    };
    xhr.onerror = onError;

    xhr.onload = () => {
      if (xhr.status === 200 && xhr.responseText.length > 0) {
        const features = vectorSource
          .getFormat()
          .readFeatures(xhr.responseText, readOptions) as OlFeature[];

        if (features) {
          vectorSource.addFeatures(features);
          success(features);
        } else {
          success([]);
        }
        this.removeRequest(request);
      } else {
        onError();
      }
    };

    request.xhr = xhr;
    this.lastRequest = request;
    this.ongoingRequests.push(request);

    xhr.send();
  }

  private removeRequest(request: VectorRequest): void {
    if (request === this.lastRequest) {
      this.lastRequest = undefined;
    }
    const index = this.ongoingRequests.indexOf(request);
    if (index > -1) {
      this.ongoingRequests.splice(index, 1);
    }
  }

  /**
   * Custom loader for vector layer.
   * @internal
   * @param vectorSource the vector source to be created
   * @param url the url string or function to retrieve the data
   * @param extent the extent of the requested data
   * @param projection the projection to retrieve the data
   */
  private customLoader(
    vectorSource: olSourceVector,
    url: string,
    extent: Extent,
    projection: olProjection,
    success: (features: OlFeature[]) => void,
    failure: () => void
  ) {
    const xhr = new XMLHttpRequest();
    let modifiedUrl = url;
    if (typeof url !== 'function') {
      const alteredUrlWithKeyAuth =
        this.authInterceptor.alterUrlWithKeyAuth(url);
      if (alteredUrlWithKeyAuth) {
        modifiedUrl = alteredUrlWithKeyAuth;
      }
    }

    if (this.geoNetworkService && typeof url !== 'function') {
      const format = vectorSource.getFormat();
      const type = format.getType();

      const responseType = type;
      const onError = () => {
        vectorSource.removeLoadedExtent(extent);
        failure();
      };

      const options: SimpleGetOptions = { responseType };
      this.geoNetworkService.geoDBService
        .get(url)
        .pipe(delay(750))
        .pipe(
          concatMap((r) =>
            r
              ? of(r)
              : this.geoNetworkService.get(modifiedUrl as string, options).pipe(
                  first(),
                  catchError((res) => {
                    onError();
                    throw res;
                  })
                )
          )
        )
        .subscribe((content) => {
          if (content) {
            const format = vectorSource.getFormat();
            const type = format.getType();
            let source;
            if (type === 'json' || type === 'text') {
              source = content;
            } else if (type === 'xml') {
              source = content;
              if (!source) {
                source = new DOMParser().parseFromString(
                  content,
                  'application/xml'
                );
              }
            } else if (type === 'arraybuffer') {
              source = content;
            }
            if (source) {
              const features = format.readFeatures(source, {
                extent,
                featureProjection: projection
              }) as OlFeature[];
              vectorSource.addFeatures(features);
              success(features);
            } else {
              onError();
            }
          }
        });
    } else {
      xhr.open('GET', modifiedUrl as string);
      const format = vectorSource.getFormat();
      if (format.getType() === 'arraybuffer') {
        xhr.responseType = 'arraybuffer';
      }
      if (this.authInterceptor) {
        this.authInterceptor.interceptXhr(xhr, modifiedUrl as string);
      }

      const onError = () => {
        vectorSource.removeLoadedExtent(extent);
        failure();
      };
      xhr.onerror = onError;
      xhr.onload = () => {
        // status will be 0 for file:// urls
        if (!xhr.status || (xhr.status >= 200 && xhr.status < 300)) {
          const type = format.getType();
          let source;
          if (type === 'json' || type === 'text') {
            source = xhr.responseText;
          } else if (type === 'xml') {
            source = xhr.responseXML;
            if (!source) {
              source = new DOMParser().parseFromString(
                xhr.responseText,
                'application/xml'
              );
            }
          } else if (type === 'arraybuffer') {
            source = xhr.response;
          }
          if (source) {
            const features = format.readFeatures(source, {
              extent,
              featureProjection: projection
            }) as OlFeature[];
            vectorSource.addFeatures(features);
            success(features);
          } else {
            onError();
          }
        } else {
          onError();
        }
      };
      xhr.send();
    }
  }

  /**
   * Custom loader for vector layer.
   * @internal
   * @param vectorSource the vector source to be created
   * @param layerID the url string or function to retrieve the data
   * @param extent the extent of the requested data
   * @param resolution the current resolution
   * @param projection the projection to retrieve the data
   */
  private customIDBLoader(
    vectorSource,
    layerID,
    extent,
    projection,
    success,
    failure
  ) {
    if (this.geoNetworkService) {
      const onError = () => {
        vectorSource.removeLoadedExtent(extent);
        failure();
      };
      this.geoNetworkService.geoDBService.get(layerID).subscribe((content) => {
        if (content) {
          const format = vectorSource.getFormat();
          const type = format.getType();
          let source;
          if (type === 'json' || type === 'text') {
            source = content;
          } else if (type === 'xml') {
            source = content;
            if (!source) {
              source = new DOMParser().parseFromString(
                content,
                'application/xml'
              );
            }
          } else if (type === 'arraybuffer') {
            source = content;
          }
          if (source) {
            const features = format.readFeatures(source, {
              extent,
              featureProjection: projection
            });
            vectorSource.addFeatures(features, format.readProjection(source));
            success(features);
          } else {
            onError();
          }
        }
      });
    }
  }
}
