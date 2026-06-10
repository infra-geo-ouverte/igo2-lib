import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { ObjectUtils, resolveUrl } from '@igo2/utils';

import olAttribution from 'ol/control/Attribution';
import { EsriJSON, WMSCapabilities, WMTSCapabilities } from 'ol/format';
import * as olproj from 'ol/proj';
import { optionsFromCapabilities } from 'ol/source/WMTS.js';

import { Observable, forkJoin, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';

import {
  ArcgisLayerOptions,
  ArcgisLegendInfo,
  ArcgisServiceCapabilities
} from '../../catalog/shared/arcgis-catalog.interface';
import {
  WmsCapabilityLayer,
  WmsDimension,
  WmsStyle,
  WmtsCapabilities,
  WmtsCapabilityLayer
} from '../../catalog/shared/catalog.interface';
import {
  TimeFilterStyle,
  TimeFilterType
} from '../../filter/shared/time-filter.enum';
import { TimeFilterOptions } from '../../filter/shared/time-filter.interface';
import type {
  ItemStyleOptions,
  LegendOptions
} from '../../layer/shared/layers/legend.interface';
import { MapService } from '../../map/shared/map.service';
import { getResolutionFromScale } from '../../map/shared/map.utils';
import {
  QueryFormat,
  QueryFormatMimeType
} from '../../query/shared/query.enums';
import { EsriStyleGenerator } from '../../style/shared/esri-style-generator';
import {
  GetCapabilitiesParams,
  TypeCapabilities,
  TypeCapabilitiesStrings
} from './capabilities.interface';
import { ArcGISRestDataSourceOptions } from './datasources/arcgisrest-datasource.interface';
import { CartoDataSourceOptions } from './datasources/carto-datasource.interface';
import { ArcGISRestImageDataSourceOptions } from './datasources/imagearcgisrest-datasource.interface';
import { TileArcGISRestDataSourceOptions } from './datasources/tilearcgisrest-datasource.interface';
import { WMSDataSourceOptions } from './datasources/wms-datasource.interface';
import { WMTSDataSourceOptions } from './datasources/wmts-datasource.interface';

@Injectable({
  providedIn: 'root'
})
export class CapabilitiesService {
  private http = inject(HttpClient);
  private mapService = inject(MapService);
  private configService = inject(ConfigService);
  private mapServerUrl?: string;

  private parsers = {
    wms: new WMSCapabilities(),
    wmts: new WMTSCapabilities(),
    esriJSON: new EsriJSON()
  };

  constructor() {
    this.mapServerUrl = this.configService.getConfig<string>('mapServerUrl');
  }

  getWMSOptions(
    baseOptions: WMSDataSourceOptions
  ): Observable<WMSDataSourceOptions> {
    const url = baseOptions.url;
    const version = (baseOptions.params as unknown as Record<string, string>)
      .VERSION;

    return this.getCapabilities('wms', url, version).pipe(
      map((capabilities) => {
        return capabilities
          ? this.parseWMSOptions(baseOptions, capabilities)
          : null;
      }),
      filter((options): options is WMSDataSourceOptions => options !== null)
    );
  }

  getWMTSOptions(
    baseOptions: WMTSDataSourceOptions
  ): Observable<WMTSDataSourceOptions> {
    const url = baseOptions.url!;
    const version = baseOptions.version;

    const options = this.getCapabilities('wmts', url, version).pipe(
      map((capabilities) => {
        return capabilities
          ? this.parseWMTSOptions(baseOptions, capabilities)
          : null;
      }),
      filter((options): options is WMTSDataSourceOptions => options !== null)
    );
    return options;
  }

  getCartoOptions(
    baseOptions: CartoDataSourceOptions
  ): Observable<CartoDataSourceOptions> {
    const baseUrl =
      'https://' +
      baseOptions.account +
      '.carto.com/api/v2/viz/' +
      baseOptions.mapId +
      '/viz.json';

    return this.http
      .jsonp(baseUrl, 'callback')
      .pipe(
        map((cartoOptions: any) =>
          this.parseCartoOptions(baseOptions, cartoOptions)
        )
      );
  }

  @Cacheable({
    maxCacheCount: 20
  })
  getArcgisOptions(
    baseOptions: ArcGISRestDataSourceOptions
  ): Observable<ArcGISRestDataSourceOptions> {
    const baseUrl = baseOptions.url + '/' + baseOptions.layer + '?f=json';
    const serviceCapabilities = this.getCapabilities(
      'arcgisrest',
      baseOptions.url!
    );
    const arcgisOptions = this.http.get(baseUrl);
    return forkJoin([arcgisOptions, serviceCapabilities]).pipe(
      map((res) => {
        return this.parseArcgisOptions(baseOptions, res[0], res[1]);
      })
    );
  }

  @Cacheable({
    maxCacheCount: 20
  })
  getImageArcgisOptions(
    baseOptions:
      | ArcGISRestImageDataSourceOptions
      | TileArcGISRestDataSourceOptions
  ): Observable<
    ArcGISRestImageDataSourceOptions | TileArcGISRestDataSourceOptions
  > {
    const baseUrl = baseOptions.url + '/' + baseOptions.layer + '?f=json';
    const legendUrl = baseOptions.url + '/legend?f=json';
    const serviceCapabilities = this.getCapabilities(
      'imagearcgisrest',
      baseOptions.url!
    );
    const arcgisOptions = this.http.get(baseUrl);
    const legend = this.http.get(legendUrl).pipe(
      map((res) => res),
      catchError((err) => {
        console.log('No legend associated with this Image Service');
        return of(err);
      })
    );
    return forkJoin([arcgisOptions, legend, serviceCapabilities]).pipe(
      map((res) => {
        return this.parseTileOrImageArcgisOptions(
          baseOptions,
          res[0],
          res[1],
          res[2]
        );
      })
    );
  }

  @Cacheable({
    maxCacheCount: 20
  })
  getTileArcgisOptions(
    baseOptions: TileArcGISRestDataSourceOptions
  ): Observable<
    ArcGISRestImageDataSourceOptions | TileArcGISRestDataSourceOptions
  > {
    const baseUrl = baseOptions.url + '/' + baseOptions.layer + '?f=json';
    const legendUrl = baseOptions.url + '/legend?f=json';
    const serviceCapabilities = this.getCapabilities(
      'tilearcgisrest',
      baseOptions.url!
    );
    const arcgisOptions = this.http.get(baseUrl);
    const legendInfo = this.http.get(legendUrl).pipe(
      map((res) => res),
      catchError((err) => {
        console.log('No legend associated with this Tile Service');
        return of(err);
      })
    );
    return forkJoin([arcgisOptions, legendInfo, serviceCapabilities]).pipe(
      map((res) =>
        this.parseTileOrImageArcgisOptions(baseOptions, res[0], res[1], res[2])
      )
    );
  }

  @Cacheable({
    maxCacheCount: 20
  })
  getCapabilities(
    service: TypeCapabilitiesStrings,
    baseUrl: string,
    version?: string
  ): Observable<any> {
    const resolvedUrl = resolveUrl(baseUrl, this.mapServerUrl);

    const fullParams: Record<GetCapabilitiesParams | '_i', string> = {
      request: 'GetCapabilities',
      service: service.toUpperCase(),
      version: version || '1.3.0',
      _i: 'true'
    };
    const params = this.buildHttpParams(resolvedUrl, fullParams);

    let request;
    if (TypeCapabilities[service] === 'esriJSON') {
      request = this.http.get(resolvedUrl + '?f=json');
    } else {
      request = this.http.get(resolvedUrl, {
        params,
        responseType: 'text'
      });
    }

    return request.pipe(
      map((res) => {
        if (TypeCapabilities[service] === 'esriJSON') {
          return res as object;
        }
        if (
          String(res).toLowerCase().includes('serviceexception') &&
          String(res).toLowerCase().includes('access denied')
        ) {
          throw {
            error: {
              message: 'Service error getCapabilities: Access is denied'
            }
          };
        } else {
          return this.parsers[service as 'wms' | 'wmts'].read(res as string);
        }
      }),
      catchError((e) => {
        if (typeof e.error !== 'undefined') {
          e.error.caught = true;
        }
        throw e;
      })
    );
  }

  private parseWMSOptions(
    baseOptions: WMSDataSourceOptions,
    capabilities: any
  ): WMSDataSourceOptions {
    const layers = (baseOptions.params as any).LAYERS;
    const layer = this.findDataSourceInCapabilities(
      capabilities.Capability.Layer,
      layers
    );

    if (!layer) {
      throw {
        error: {
          message: 'Layer not found'
        }
      };
    }
    const metadata = layer.DataURL ? layer.DataURL[0] : undefined;
    const abstract = layer.Abstract ? layer.Abstract : undefined;
    const keywordList = layer.KeywordList ? layer.KeywordList : undefined;
    let queryable = layer.queryable;
    const timeFilter = this.getTimeFilter(layer);
    const timeFilterable = timeFilter && Object.keys(timeFilter).length > 0;
    const legendOptions = layer.Style ? this.getStyle(layer.Style) : undefined;
    let isExtentInGeographic = true;
    if (layer.EX_GeographicBoundingBox) {
      layer.EX_GeographicBoundingBox.forEach((coord, index) => {
        if (index < 2 && (coord > 180 || coord < -180)) {
          isExtentInGeographic = false;
        }
        if (index >= 2 && (coord > 90 || coord < -90)) {
          isExtentInGeographic = false;
        }
      });
    } else {
      isExtentInGeographic = false;
    }

    const extent = isExtentInGeographic
      ? olproj.transformExtent(
          layer.EX_GeographicBoundingBox as [number, number, number, number],
          'EPSG:4326',
          this.mapService.getMap()?.projection
        )
      : undefined;

    let queryFormat: QueryFormat | undefined;
    const queryFormatMimeTypePriority = [
      QueryFormatMimeType.GEOJSON,
      QueryFormatMimeType.GEOJSON2,
      QueryFormatMimeType.GML3,
      QueryFormatMimeType.GML2,
      QueryFormatMimeType.JSON,
      QueryFormatMimeType.HTML
    ];

    for (const mimeType of queryFormatMimeTypePriority) {
      if (
        capabilities.Capability.Request.GetFeatureInfo.Format.indexOf(
          mimeType
        ) !== -1
      ) {
        const keyEnum = Object.keys(QueryFormatMimeType).find(
          (key) =>
            QueryFormatMimeType[key as keyof typeof QueryFormatMimeType] ===
            mimeType
        );
        if (keyEnum !== undefined) {
          queryFormat = QueryFormat[keyEnum as keyof typeof QueryFormat];
        }
        break;
      }
    }
    if (!queryFormat) {
      queryable = false;
    }

    if (baseOptions.params.STYLES) {
      const style = legendOptions?.stylesAvailable?.find(
        (style) => style.name === baseOptions.params.STYLES
      );
      if (!style) {
        delete baseOptions.params.STYLES;
      }
    }

    const options: WMSDataSourceOptions = ObjectUtils.removeUndefined({
      _layerOptionsFromSource: {
        title: layer.Title,
        maxResolution:
          layer.MaxScaleDenominator !== undefined
            ? getResolutionFromScale(layer.MaxScaleDenominator)
            : undefined,
        minResolution:
          layer.MinScaleDenominator !== undefined
            ? getResolutionFromScale(layer.MinScaleDenominator)
            : undefined,
        extent,
        metadata: {
          url: metadata ? metadata.OnlineResource : undefined,
          extern: metadata ? true : undefined,
          abstract,
          keywordList
        },
        legendOptions
      },
      queryable,
      queryFormat,
      timeFilter: timeFilterable ? timeFilter : undefined,
      timeFilterable: timeFilterable ? true : undefined,
      minDate: timeFilterable ? timeFilter.min : undefined,
      maxDate: timeFilterable ? timeFilter.max : undefined,
      stepDate: timeFilterable ? timeFilter.step : undefined
    }) as unknown as WMSDataSourceOptions;

    return ObjectUtils.mergeDeep<WMSDataSourceOptions>(options, baseOptions);
  }

  private parseWMTSOptions(
    baseOptions: WMTSDataSourceOptions,
    capabilities: WmtsCapabilities
  ): WMTSDataSourceOptions {
    // Put Title source in _layerOptionsFromSource. (For source & catalog in _layerOptionsFromSource, if not already on config)
    const layer = capabilities.Contents.Layer.find(
      (el: WmtsCapabilityLayer) => el.Identifier === baseOptions.layer
    );

    const options = optionsFromCapabilities(capabilities, baseOptions);

    const ouputOptions = Object.assign(options ?? {}, baseOptions);
    const sourceOptions = ObjectUtils.removeUndefined({
      _layerOptionsFromSource: {
        title: layer!.Title ?? ''
      }
    }) as unknown as WMTSDataSourceOptions;

    return ObjectUtils.mergeDeep<WMTSDataSourceOptions>(
      sourceOptions,
      ouputOptions
    );
  }

  private parseCartoOptions(
    baseOptions: CartoDataSourceOptions,
    cartoOptions: Record<string, unknown>
  ): CartoDataSourceOptions {
    const layers: { type: string; options: unknown; legend: unknown }[] = [];
    const params = (cartoOptions.layers as any)[1].options.layer_definition;

    params.layers.forEach((element: any) => {
      layers.push({
        type: element.type.toLowerCase(),
        options: element.options,
        legend: element.legend
      });
    });
    const options = ObjectUtils.removeUndefined({
      config: {
        version: params.version,
        layers
      }
    }) as CartoDataSourceOptions;
    return ObjectUtils.mergeDeep(options, baseOptions);
  }

  private parseArcgisOptions(
    baseOptions: ArcGISRestDataSourceOptions,
    arcgisOptions: ArcgisLayerOptions,
    serviceCapabilities: ArcgisServiceCapabilities
  ): ArcGISRestDataSourceOptions {
    const title = arcgisOptions.name;
    let legendInfo: unknown;

    if (arcgisOptions.drawingInfo?.renderer) {
      legendInfo = arcgisOptions.drawingInfo.renderer;
    } else {
      legendInfo = undefined;
    }

    let style;
    if (arcgisOptions.drawingInfo) {
      const styleGenerator = new EsriStyleGenerator();
      const units = arcgisOptions.units === 'esriMeters' ? 'm' : 'degrees';
      style = styleGenerator.generateStyle(
        arcgisOptions as Parameters<typeof styleGenerator.generateStyle>[0],
        units
      );
    }
    const attributions = new olAttribution({
      target: arcgisOptions.copyrightText
    });
    let timeExtent;
    let timeFilter;
    if (arcgisOptions.timeInfo) {
      const time = arcgisOptions.timeInfo.timeExtent;
      timeExtent = time[0] + ',' + time[1];
      const min = new Date();
      min.setTime(time[0]);
      const max = new Date();
      max.setTime(time[1]);
      timeFilter = {
        min: min.toUTCString(),
        max: max.toUTCString(),
        range: true,
        type: TimeFilterType.DATETIME,
        style: TimeFilterStyle.CALENDAR
      };
    }
    const params = Object.assign(
      {},
      {
        style,
        LAYERS: baseOptions.layer ? 'show:' + baseOptions.layer : undefined,
        time: timeExtent
      }
    );
    const options = ObjectUtils.removeUndefined<Record<string, unknown>>({
      params,
      _layerOptionsFromSource: {
        title,
        minResolution:
          arcgisOptions.minScale !== undefined
            ? getResolutionFromScale(arcgisOptions.minScale)
            : undefined,
        maxResolution:
          arcgisOptions.maxScale !== undefined
            ? getResolutionFromScale(arcgisOptions.maxScale)
            : undefined,
        metadata: {
          extern: false,
          abstract:
            arcgisOptions.description || serviceCapabilities.serviceDescription
        }
      },
      legendInfo,
      timeFilter,
      sourceFields: arcgisOptions.fields,
      queryTitle: arcgisOptions.displayField
    });
    options['attributions'] = attributions;
    return ObjectUtils.mergeDeep(
      options,
      baseOptions
    ) as unknown as ArcGISRestDataSourceOptions;
  }

  private parseTileOrImageArcgisOptions(
    baseOptions:
      | TileArcGISRestDataSourceOptions
      | ArcGISRestImageDataSourceOptions,
    arcgisOptions: ArcgisLayerOptions,
    legend: ArcgisLegendInfo,
    serviceCapabilities: ArcgisServiceCapabilities
  ): TileArcGISRestDataSourceOptions | ArcGISRestImageDataSourceOptions {
    const title = arcgisOptions.name;
    const legendInfo = legend.layers
      ? legend.layers.find((x) => x.layerName === title)
      : undefined;
    const attributions = new olAttribution({
      target: arcgisOptions.copyrightText
    });
    let timeExtent;
    let timeFilter;
    if (arcgisOptions.timeInfo) {
      const time = arcgisOptions.timeInfo.timeExtent;
      timeExtent = time[0] + ',' + time[1];
      const min = new Date();
      min.setTime(time[0]);
      const max = new Date();
      max.setTime(time[1]);
      timeFilter = {
        min: min.toUTCString(),
        max: max.toUTCString(),
        range: true,
        type: TimeFilterType.DATETIME,
        style: TimeFilterStyle.CALENDAR
      };
    }
    const params = Object.assign(
      {},
      {
        LAYERS: baseOptions.layer ? 'show:' + baseOptions.layer : undefined,
        time: timeExtent
      }
    );
    const options = ObjectUtils.removeUndefined<Record<string, unknown>>({
      params,
      _layerOptionsFromSource: {
        title,
        minResolution:
          arcgisOptions.minScale !== undefined
            ? getResolutionFromScale(arcgisOptions.minScale)
            : undefined,
        maxResolution:
          arcgisOptions.maxScale !== undefined
            ? getResolutionFromScale(arcgisOptions.maxScale)
            : undefined,
        metadata: {
          extern: false,
          abstract:
            arcgisOptions.description || serviceCapabilities.serviceDescription
        }
      },
      legendInfo,
      timeFilter,
      sourceFields: arcgisOptions.fields,
      queryTitle: arcgisOptions.displayField
    });
    options['attributions'] = attributions;
    return ObjectUtils.mergeDeep(options, baseOptions);
  }

  private findDataSourceInCapabilities(
    layerArray: WmsCapabilityLayer | WmsCapabilityLayer[],
    name: string
  ): WmsCapabilityLayer | undefined {
    if (Array.isArray(layerArray)) {
      let layer: WmsCapabilityLayer | undefined;
      layerArray.find((value) => {
        layer = this.findDataSourceInCapabilities(value, name);
        return layer !== undefined;
      }, this);

      return layer;
    } else if (layerArray.Layer) {
      return this.findDataSourceInCapabilities(layerArray.Layer, name);
    } else {
      if (layerArray.Name && layerArray.Name === name) {
        return layerArray;
      }
      return undefined;
    }
  }

  getTimeFilter(layer: WmsCapabilityLayer): TimeFilterOptions | undefined {
    let dimension: WmsDimension | undefined;

    if (layer.Dimension) {
      const timeFilter: TimeFilterOptions = {};
      dimension = layer.Dimension[0];

      if (dimension?.values) {
        const minMaxDim = dimension.values.split('/');
        timeFilter.min = minMaxDim[0] !== undefined ? minMaxDim[0] : undefined;
        timeFilter.max = minMaxDim[1] !== undefined ? minMaxDim[1] : undefined;
        timeFilter.step =
          minMaxDim[2] !== undefined
            ? (minMaxDim[2] as unknown as number)
            : undefined;
      }

      if (dimension?.default) {
        timeFilter.value = timeFilter.default = dimension.default;
      }
      return timeFilter;
    }
    return undefined;
  }

  getStyle(Style: WmsStyle[]): LegendOptions {
    const styleOptions: ItemStyleOptions[] = Style.map((style) => {
      return {
        name: style.Name,
        title: style.Title
      };
    })
      // Handle repeat the style "default" in output  (MapServer or OpenLayer)
      .filter(
        (item: ItemStyleOptions, index: number, self: ItemStyleOptions[]) =>
          self.findIndex((i: ItemStyleOptions) => i.name === item.name) ===
          index
      );

    const legendOptions: LegendOptions = {
      stylesAvailable: styleOptions
    } as LegendOptions;

    return legendOptions;
  }

  /**
   * Builds HttpParams by excluding keys already present in the base URL's query string.
   * This avoids duplicate parameters when appending to an existing URL.
   */
  private buildHttpParams(
    url: string,
    params: Record<string, string>
  ): HttpParams {
    const [, queryString] = url.split('?');

    const existingKeys = new Set(
      (queryString ?? '')
        .split('&')
        .map((pair) => pair.split('=')[0].trim())
        .filter(Boolean)
    );

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key]) => !existingKeys.has(key))
    );

    return new HttpParams({ fromObject: filteredParams });
  }
}
