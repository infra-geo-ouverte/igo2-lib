import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { MessageService } from '@igo2/core/message';
import { uuid } from '@igo2/utils';

import olFeature from 'ol/Feature';
import * as olextent from 'ol/extent';
import * as olformat from 'ol/format';
import olFormatEsriJSON from 'ol/format/EsriJSON';
import olFormatGML2 from 'ol/format/GML2';
import olFormatGML3 from 'ol/format/GML3';
import * as olgeom from 'ol/geom';

import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { default as striptags } from 'striptags';

import {
  CartoDataSource,
  ImageArcGISRestDataSource,
  TileArcGISRestDataSource,
  WMSDataSource,
  WMSDataSourceOptions
} from '../../datasource/shared/datasources';
import { FEATURE } from '../../feature/shared/feature.enums';
import {
  Feature,
  FeatureGeometry
} from '../../feature/shared/feature.interfaces';
import { Layer } from '../../layer';
import { MapExtent } from '../../map/shared/map.interface';
import {
  QueryFormat,
  QueryFormatMimeType,
  QueryHtmlTarget
} from './query.enums';
import {
  QueryOptions,
  QueryUrlData,
  QueryableDataSource,
  QueryableDataSourceOptions
} from './query.interfaces';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  public queryEnabled = true;
  public defaultFeatureCount = 20;
  public featureCount = 20;

  private previousMessageIds = [];

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  query(layers: Layer[], options: QueryOptions): Observable<Feature[]>[] {
    if (this.previousMessageIds.length) {
      this.previousMessageIds.forEach((id) => {
        this.messageService.remove(id);
      });
    }

    const queries$ = layers
      .filter((layer) => layer.displayed === true)
      .map((layer) => this.queryLayer(layer, options));
    // the directive accept array in this format [observable, observable...]
    // if we use multiple 'url' in queryUrl so the result => this form [observable, observable, [observable, observable]]
    // so we need to flat the array
    // eslint-disable-next-line prefer-spread
    const flattenedQueries$ = [].concat.apply([], queries$);
    return flattenedQueries$;
  }

  queryLayer(
    layer: Layer,
    options: QueryOptions
  ): Observable<Feature[]> | Observable<Feature[]>[] {
    const url = this.getQueryUrl(
      layer.dataSource as QueryableDataSource,
      options,
      false,
      layer.map.viewController.getExtent()
    );
    if (!url) {
      return of([]);
    }

    const resolution: number = layer.map.viewController.getResolution();
    const scale: number = layer.map.viewController.getScale();

    if (
      (layer.dataSource as QueryableDataSource).options.queryFormat ===
      QueryFormat.HTMLGML2
    ) {
      if (typeof url === 'string') {
        const urlGml = this.getQueryUrl(
          layer.dataSource as QueryableDataSource,
          options,
          true
        ) as string;
        return this.http.get(urlGml, { responseType: 'text' }).pipe(
          mergeMap((gmlRes) => {
            const mergedGML = this.mergeGML(gmlRes, url, layer);
            const imposedGeom = mergedGML[0];
            const imposedProperties = mergedGML[1];
            return this.http
              .get(url, { responseType: 'text' })
              .pipe(
                map((res) =>
                  this.extractData(
                    res,
                    layer,
                    options,
                    url,
                    imposedGeom,
                    imposedProperties
                  )
                )
              );
          })
        );
      }
      const urlGmls = this.getQueryUrl(
        layer.dataSource as QueryableDataSource,
        options,
        true
      );
      const observables: Observable<Feature[]>[] = [];
      for (let i = 0; i < urlGmls.length; i++) {
        const element = urlGmls[i] as QueryUrlData;
        if (this.checkScaleAndResolution(resolution, scale, element)) {
          observables.push(
            this.requestDataForHTMLGML2(element.url, url[i].url, layer, options)
          );
        }
      }
      return observables;
    } else {
      if (typeof url === 'string') {
        const request = this.http.get(url, { responseType: 'text' });
        return request.pipe(
          map((res) => this.extractData(res, layer, options, url))
        );
      }
      const observables: any = [];
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < url.length; i++) {
        const element: QueryUrlData = url[i];
        if (this.checkScaleAndResolution(resolution, scale, element)) {
          const request = this.http.get(element.url, { responseType: 'text' });
          observables.push(
            request.pipe(
              map((res) => this.extractData(res, layer, options, element.url))
            )
          );
        }
      }
      return observables;
    }
  }

  private requestDataForHTMLGML2(
    urlGml: string,
    url: string,
    layer: Layer,
    options: QueryOptions
  ): Observable<Feature[]> {
    return this.http.get(urlGml, { responseType: 'text' }).pipe(
      mergeMap((gmlRes) => {
        const mergedGML = this.mergeGML(gmlRes, url, layer);
        const imposedGeom = mergedGML[0];
        const imposedProperties = mergedGML[1];
        return this.http
          .get(url, { responseType: 'text' })
          .pipe(
            map((res) =>
              this.extractData(
                res,
                layer,
                options,
                url,
                imposedGeom,
                imposedProperties
              )
            )
          );
      })
    );
  }

  private checkScaleAndResolution(
    resolution: number,
    scale: number,
    element: QueryUrlData
  ): boolean {
    let checkScale: boolean;
    let checkResolution: boolean;

    if (
      !element.minResolution &&
      !element.maxResolution &&
      !element.minScale &&
      !element.maxScale
    ) {
      return true;
    } else {
      /******************* checking Resolution *******************/
      if (element.minResolution && element.maxResolution) {
        // if "minResolution" and "maxResolution" exists check if resoltion is between
        if (
          resolution >= element.minResolution &&
          resolution <= element.maxResolution
        ) {
          checkResolution = true;
        }
      } else {
        // check if "minResolution" or "maxResolution" exists
        if (element.minResolution && resolution >= element.minResolution) {
          checkResolution = true;
        }
        if (element.maxResolution && resolution <= element.maxResolution) {
          checkResolution = true;
        }
      }

      /******************* checking Scale *******************/
      if (element.minScale && element.maxScale) {
        // if "minScale" and "maxScale" exists check if scale is between
        if (scale > element.minScale && scale < element.maxScale) {
          checkScale = true;
        }
      } else {
        // check if "minScale" or "maxScale" exists
        if (element.maxScale && scale <= element.maxScale) {
          checkScale = true;
        }
        if (element.minScale && scale >= element.minScale) {
          checkScale = true;
        }
      }

      /******************* result of checking *******************/
      if (checkScale === true && checkResolution === true) {
        return true;
      } else if (
        (checkResolution === true && !checkScale) ||
        (checkScale === true && !checkResolution)
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  private mergeGML(
    gmlRes,
    url,
    layer: Layer
  ): [FeatureGeometry, Record<string, any>] {
    const parser = new olFormatGML2();
    let features = parser.readFeatures(gmlRes);
    // Handle non standard GML output (MapServer)
    if (features.length === 0) {
      const wmsParser = new olformat.WMSGetFeatureInfo();
      features = wmsParser.readFeatures(gmlRes);
    }
    const olmline = new olgeom.MultiLineString([]);
    let pts;
    const ptsArray = [];
    let olmpoly = new olgeom.MultiPolygon([]);
    let firstFeatureType;
    const nbFeatures = features.length;

    // Check if geometry intersect bbox
    // for geoserver getfeatureinfo response in data projection, not call projection
    const searchParams: any = this.getQueryParams(url.toLowerCase());
    const bboxRaw = searchParams.bbox;
    const bbox = bboxRaw.split(',');
    const bboxExtent = olextent.createEmpty();
    olextent.extend(bboxExtent, bbox);
    const outBboxExtent = false;
    let titleContent;
    let queryTileField;
    if (layer.options?.source?.options) {
      const dataSourceOptions = layer.options.source
        .options as QueryableDataSourceOptions;
      if (dataSourceOptions.queryTitle) {
        queryTileField = dataSourceOptions.queryTitle;
      }
    }
    features.map((feature) => {
      if (queryTileField) {
        const queryTitleContent = feature.getProperties()[queryTileField];
        if (queryTitleContent) {
          titleContent = !titleContent
            ? queryTitleContent
            : `${titleContent},${queryTitleContent}`;
        }
      }
      /*  if (!feature.getGeometry().simplify(100).intersectsExtent(bboxExtent)) {
        outBboxExtent = true;
        // TODO: Check to project the geometry?
      }*/
      const featureGeometryCoordinates = (
        feature.getGeometry() as any
      ).getCoordinates();
      const featureGeometryType = feature.getGeometry().getType();

      if (!firstFeatureType && !outBboxExtent) {
        firstFeatureType = featureGeometryType;
      }
      if (!outBboxExtent) {
        switch (featureGeometryType) {
          case 'Point':
            if (nbFeatures === 1) {
              pts = new olgeom.Point(featureGeometryCoordinates, 'XY');
            } else {
              ptsArray.push(featureGeometryCoordinates);
            }
            break;
          case 'LineString':
            olmline.appendLineString(
              new olgeom.LineString(featureGeometryCoordinates, 'XY')
            );
            break;
          case 'Polygon':
            olmpoly.appendPolygon(
              new olgeom.Polygon(featureGeometryCoordinates, 'XY')
            );
            break;
          case 'MultiPolygon':
            olmpoly = new olgeom.MultiPolygon(featureGeometryCoordinates, 'XY');
            break;
          default:
            return;
        }
      }
    });

    let olmpts;
    if (ptsArray.length === 0 && pts) {
      olmpts = {
        type: pts.getType(),
        coordinates: pts.getCoordinates()
      };
    } else {
      olmpts = {
        type: 'Polygon',
        coordinates: [this.convexHull(ptsArray)]
      };
    }

    let returnGeometry;
    switch (firstFeatureType) {
      case 'LineString':
        returnGeometry = {
          type: olmline.getType(),
          coordinates: olmline.getCoordinates()
        };
        break;
      case 'Point':
        returnGeometry = olmpts;
        break;
      case 'Polygon':
        returnGeometry = {
          type: olmpoly.getType(),
          coordinates: olmpoly.getCoordinates()
        };
        break;
      case 'MultiPolygon':
        returnGeometry = {
          type: olmpoly.getType(),
          coordinates: olmpoly.getCoordinates()
        };
        break;
    }
    const imposedProperties = {};

    if (queryTileField) {
      imposedProperties[queryTileField] = titleContent;
    }

    return [returnGeometry, imposedProperties];
  }

  cross(a, b, o) {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  }

  /**
   * @param points An array of [X, Y] coordinates
   * This method is use instead of turf.js convexHull because Turf needs at least 3 point to make a hull.
   * https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain#JavaScript
   */
  convexHull(points) {
    points.sort((a, b) => {
      return a[0] === b[0] ? a[1] - b[1] : a[0] - b[0];
    });

    const lower = [];
    for (const point of points) {
      while (
        lower.length >= 2 &&
        this.cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
      ) {
        lower.pop();
      }
      lower.push(point);
    }

    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
      while (
        upper.length >= 2 &&
        this.cross(
          upper[upper.length - 2],
          upper[upper.length - 1],
          points[i]
        ) <= 0
      ) {
        upper.pop();
      }
      upper.push(points[i]);
    }

    upper.pop();
    lower.pop();
    return lower.concat(upper);
  }

  private extractData(
    res,
    layer: Layer,
    options: QueryOptions,
    url: string,
    imposedGeometry?,
    imposedProperties?: Record<string, any>
  ): Feature[] {
    const queryDataSource = layer.dataSource as QueryableDataSource;

    const allowedFieldsAndAlias = this.getAllowedFieldsAndAlias(layer);
    let features = [];
    switch (queryDataSource.options.queryFormat) {
      case QueryFormat.GML3:
        features = this.extractGML3Data(
          res,
          layer.zIndex,
          allowedFieldsAndAlias
        );
        break;
      case QueryFormat.JSON:
      case QueryFormat.GEOJSON:
      case QueryFormat.GEOJSON2:
        features = this.extractGeoJSONData(
          res,
          layer.zIndex,
          allowedFieldsAndAlias
        );
        break;
      case QueryFormat.ESRIJSON:
        features = this.extractEsriJSONData(
          res,
          layer.zIndex,
          allowedFieldsAndAlias
        );
        break;
      case QueryFormat.TEXT:
        break;
      case QueryFormat.HTML:
        features = this.extractHtmlData(
          res,
          queryDataSource.queryHtmlTarget,
          url
        );
        break;
      case QueryFormat.HTMLGML2:
        features = this.extractHtmlData(
          res,
          queryDataSource.queryHtmlTarget,
          url,
          imposedGeometry,
          imposedProperties
        );
        break;
      case QueryFormat.GML2:
      default:
        features = this.extractGML2Data(res, layer, allowedFieldsAndAlias);
        break;
    }
    if (
      features.length > 0 &&
      (features[0].geometry === null || !features[0].geometry)
    ) {
      const geomToAdd = this.createGeometryFromUrlClick(url);

      for (const feature of features) {
        feature.geometry = geomToAdd;
      }
    }

    const wmsDatasource = layer.dataSource as WMSDataSource;
    const featureCount = wmsDatasource.params?.FEATURE_COUNT
      ? new RegExp('FEATURE_COUNT=' + this.featureCount)
      : new RegExp('FEATURE_COUNT=' + this.defaultFeatureCount);

    if (
      featureCount.test(url) &&
      ((wmsDatasource.params?.FEATURE_COUNT &&
        this.featureCount > 1 &&
        features.length === this.featureCount) ||
        (!wmsDatasource.params?.FEATURE_COUNT &&
          features.length === this.defaultFeatureCount))
    ) {
      const messageObj = this.messageService.info(
        'igo.geo.query.featureCountMax',
        undefined,
        undefined,
        { value: layer.title }
      );
      this.previousMessageIds.push(messageObj.toastId);
    }

    return features.map((feature: Feature, index: number) => {
      const mapLabel = feature.properties[queryDataSource.mapLabel];

      let exclude;
      if (layer.options.sourceOptions?.type === 'wms') {
        const sourceOptions = layer.options
          .sourceOptions as WMSDataSourceOptions;
        exclude = sourceOptions ? sourceOptions.excludeAttribute : undefined;
      }

      let title = this.getQueryTitle(feature, layer);
      if (!title && features.length > 1) {
        title = `${layer.title} (${index + 1})`;
      } else if (!title) {
        title = layer.title;
      }

      const meta = Object.assign({}, feature.meta || {}, {
        id: uuid(),
        title,
        mapTitle: mapLabel,
        sourceTitle: layer.title,
        order: 1000 - layer.zIndex,
        excludeAttribute: exclude
      });

      return Object.assign(feature, {
        meta,
        projection:
          queryDataSource.options.type === 'carto'
            ? 'EPSG:4326'
            : options.projection
      });
    });
  }

  private createGeometryFromUrlClick(url) {
    const searchParams: any = this.getQueryParams(url.toLowerCase());
    const bboxRaw = searchParams.bbox;
    const width = parseInt(searchParams.width, 10);
    const height = parseInt(searchParams.height, 10);
    const xPosition = parseInt(searchParams.i || searchParams.x, 10);
    const yPosition = parseInt(searchParams.j || searchParams.y, 10);

    const bbox = bboxRaw.split(',');
    let threshold =
      (Math.abs(parseFloat(bbox[0])) - Math.abs(parseFloat(bbox[2]))) * 0.05;

    // for context in degree (EPSG:4326,4269...)
    if (Math.abs(parseFloat(bbox[0])) < 180) {
      threshold = 0.045;
    }
    const clickx =
      parseFloat(bbox[0]) +
      (Math.abs(parseFloat(bbox[0]) - parseFloat(bbox[2])) * xPosition) /
        width -
      threshold;
    const clicky =
      parseFloat(bbox[1]) +
      (Math.abs(parseFloat(bbox[1]) - parseFloat(bbox[3])) * yPosition) /
        height -
      threshold;
    const clickx1 = clickx + threshold * 2;
    const clicky1 = clicky + threshold * 2;

    const wktPoly =
      'POLYGON((' +
      clickx +
      ' ' +
      clicky +
      ', ' +
      clickx +
      ' ' +
      clicky1 +
      ', ' +
      clickx1 +
      ' ' +
      clicky1 +
      ', ' +
      clickx1 +
      ' ' +
      clicky +
      ', ' +
      clickx +
      ' ' +
      clicky +
      '))';

    const format = new olformat.WKT();
    const tenPercentWidthGeom = format.readFeature(wktPoly);
    const f = tenPercentWidthGeom.getGeometry() as any;

    const newGeom = {
      type: f.getType(),
      coordinates: f.getCoordinates()
    };

    return newGeom;
  }

  private extractGML2Data(res, zIndex, allowedFieldsAndAlias?) {
    const parser = new olFormatGML2();
    let features = parser.readFeatures(res);
    // Handle non standard GML output (MapServer)
    if (features.length === 0) {
      const wmsParser = new olformat.WMSGetFeatureInfo();
      try {
        features = wmsParser.readFeatures(res);
      } catch {
        console.warn(
          'query.service: Multipolygons are badly managed in mapserver in GML2. Use another format.'
        );
      }
    }

    return features.map((feature) =>
      this.featureToResult(feature, zIndex, allowedFieldsAndAlias)
    );
  }

  private extractGML3Data(res, zIndex, allowedFieldsAndAlias?) {
    const parser = new olFormatGML3();
    let features = [];
    try {
      features = parser.readFeatures(res);
    } catch {
      console.warn('query.service: GML3 is not well supported');
    }
    return features.map((feature) =>
      this.featureToResult(feature, zIndex, allowedFieldsAndAlias)
    );
  }

  private extractGeoJSONData(res, zIndex, allowedFieldsAndAlias?) {
    let features = [];
    try {
      features = JSON.parse(res.replace(/(\r|\n)/g, ' ')).features;
    } catch {
      console.warn('query.service: Unable to parse geojson', '\n', res);
    }
    features.map(
      (feature) =>
        (feature.meta = {
          id: uuid(),
          order: 1000 - zIndex,
          alias: allowedFieldsAndAlias
        })
    );
    return features;
  }

  private extractEsriJSONData(res, zIndex, allowedFieldsAndAlias) {
    if (res) {
      try {
        if (JSON.parse(res).error) {
          return [];
        }
      } catch {
        // empty catch
      }
    }
    const parser = new olFormatEsriJSON();
    const features = parser.readFeatures(res);

    return features.map((feature) =>
      this.featureToResult(feature, zIndex, allowedFieldsAndAlias)
    );
  }

  private extractHtmlData(
    res,
    htmlTarget: QueryHtmlTarget,
    url,
    imposedGeometry?,
    imposedProperties?: Record<string, any>
  ) {
    const searchParams: any = this.getQueryParams(url.toLowerCase());
    const projection = searchParams.crs || searchParams.srs || 'EPSG:3857';
    const geomToAdd = this.createGeometryFromUrlClick(url);

    if (
      htmlTarget !== QueryHtmlTarget.BLANK &&
      htmlTarget !== QueryHtmlTarget.IFRAME
    ) {
      htmlTarget = QueryHtmlTarget.IFRAME;
    }

    const bodyTagStart = res.toLowerCase().indexOf('<body>');
    const bodyTagEnd = res.toLowerCase().lastIndexOf('</body>') + 7;
    // replace \r \n  and ' ' with '' to validate if the body is really empty. Clear all the html tags from body
    const body = striptags(
      res.slice(bodyTagStart, bodyTagEnd).replace(/(\r|\n|\s)/g, '')
    );
    if (body === '' || res === '') {
      return [];
    }

    return [
      {
        type: FEATURE,
        projection,
        properties: Object.assign(
          { target: htmlTarget, body: res, url },
          imposedProperties
        ),
        geometry: imposedGeometry || geomToAdd
      }
    ];
  }

  private getQueryParams(url) {
    const queryString = url.split('?');
    if (!queryString[1]) {
      return;
    }
    const pairs = queryString[1].split('&');

    const result = {};
    pairs.forEach((pair) => {
      pair = pair.split('=');
      result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    return result;
  }

  public featureToResult(
    featureOL: olFeature<olgeom.Geometry>,
    zIndex: number,
    allowedFieldsAndAlias?
  ): Feature {
    const featureGeometry = featureOL.getGeometry() as any;
    const properties: any = Object.assign({}, featureOL.getProperties());
    delete properties.geometry;
    delete properties.GEOMETRIE;
    delete properties.boundedBy;
    delete properties.shape;
    delete properties.SHAPE;
    delete properties.SHAPE_S;
    delete properties.SHAPE_L;
    delete properties.SHAPE_P;
    delete properties.the_geom;
    delete properties.geom;
    delete properties.geom32198;

    let geometry;
    if (featureGeometry) {
      geometry = {
        type: featureGeometry.getType(),
        coordinates: featureGeometry.getCoordinates()
      };
    }

    return {
      type: FEATURE,
      projection: undefined,
      properties,
      geometry,
      meta: {
        id: uuid(),
        order: 1000 - zIndex,
        alias: allowedFieldsAndAlias
      }
    };
  }

  private getQueryUrl(
    datasource: QueryableDataSource,
    options: QueryOptions,
    forceGML2 = false,
    mapExtent?: MapExtent
  ): string | QueryUrlData[] {
    let url;

    if (datasource.options.queryUrls) {
      return this.getCustomQueryUrl(datasource, options, mapExtent);
    }

    switch (datasource.constructor) {
      case WMSDataSource: {
        const wmsDatasource = datasource as WMSDataSource;

        const WMSGetFeatureInfoOptions = {
          INFO_FORMAT:
            wmsDatasource.params.INFO_FORMAT ||
            this.getMimeInfoFormat(datasource.options.queryFormat),
          QUERY_LAYERS: wmsDatasource.params.LAYERS,
          FEATURE_COUNT:
            wmsDatasource.params.FEATURE_COUNT || this.defaultFeatureCount
        };

        if (wmsDatasource.params.FEATURE_COUNT) {
          this.featureCount = wmsDatasource.params.FEATURE_COUNT;
        }

        if (forceGML2) {
          WMSGetFeatureInfoOptions.INFO_FORMAT = this.getMimeInfoFormat(
            QueryFormat.GML2
          );
        }

        url = wmsDatasource.ol.getFeatureInfoUrl(
          options.coordinates,
          options.resolution,
          options.projection,
          WMSGetFeatureInfoOptions
        );
        // const wmsVersion =
        //   wmsDatasource.params.VERSION ||
        //   wmsDatasource.params.version ||
        //   '1.3.0';
        // if (wmsVersion !== '1.3.0') {
        //   url = url.replace('&I=', '&X=');
        //   url = url.replace('&J=', '&Y=');
        // }
        break;
      }
      case CartoDataSource: {
        const cartoDatasource = datasource as CartoDataSource;
        const baseUrl =
          'https://' +
          cartoDatasource.options.account +
          '.carto.com/api/v2/sql?';
        const format = 'format=GeoJSON';
        const sql =
          '&q=' + cartoDatasource.options.config.layers[0].options.sql;
        const clause =
          ' WHERE ST_Intersects(the_geom_webmercator,ST_BUFFER(ST_SetSRID(ST_POINT(';
        const meters = cartoDatasource.options.queryPrecision
          ? cartoDatasource.options.queryPrecision
          : '1000';
        const coordinates =
          options.coordinates[0] +
          ',' +
          options.coordinates[1] +
          '),3857),' +
          meters +
          '))';

        url = `${baseUrl}${format}${sql}${clause}${coordinates}`;
        break;
      }
      case ImageArcGISRestDataSource:
      case TileArcGISRestDataSource: {
        const tileArcGISRestDatasource = datasource as TileArcGISRestDataSource;
        const deltaX = Math.abs(mapExtent[0] - mapExtent[2]);
        const deltaY = Math.abs(mapExtent[1] - mapExtent[3]);
        const maxDelta = deltaX > deltaY ? deltaX : deltaY;
        const clickBuffer = maxDelta * 0.005;
        const threshold = tileArcGISRestDatasource.options.queryPrecision
          ? tileArcGISRestDatasource.options.queryPrecision
          : clickBuffer;
        const extent = olextent.buffer(
          olextent.boundingExtent([options.coordinates]),
          threshold
        );
        const serviceUrl =
          tileArcGISRestDatasource.options.url +
          '/' +
          tileArcGISRestDatasource.options.layer +
          '/query/';
        const geometry = encodeURIComponent(
          '{"xmin":' +
            extent[0] +
            ',"ymin":' +
            extent[1] +
            ',"xmax":' +
            extent[2] +
            ',"ymax":' +
            extent[3] +
            ',"spatialReference":{"wkid":102100}}'
        );
        const params = [
          'f=json',
          `geometry=${geometry}`,
          'geometryType=esriGeometryEnvelope',
          'inSR=102100',
          'spatialRel=esriSpatialRelIntersects',
          'outFields=*',
          'returnGeometry=true',
          'outSR=102100'
        ];
        url = `${serviceUrl}?${params.join('&')}`;
        break;
      }
      default:
        break;
    }

    return url;
  }

  private getMimeInfoFormat(queryFormat: string) {
    let mime = 'application/vnd.ogc.gml';
    const keyEnum = Object.keys(QueryFormat).find(
      (key) => QueryFormat[key] === queryFormat
    );
    if (keyEnum) {
      mime = QueryFormatMimeType[keyEnum];
    }

    return mime;
  }

  getAllowedFieldsAndAlias(layer: any) {
    let allowedFieldsAndAlias;
    if (
      layer.options?.source?.options?.sourceFields &&
      layer.options.source.options.sourceFields.length >= 1
    ) {
      allowedFieldsAndAlias = {};
      layer.options.source.options.sourceFields.forEach((sourceField) => {
        const alias = sourceField.alias ? sourceField.alias : sourceField.name;
        allowedFieldsAndAlias[sourceField.name] = alias;
      });
    }
    return allowedFieldsAndAlias;
  }

  getQueryTitle(feature: Feature, layer: Layer): string {
    let title;
    if (layer.options?.source?.options) {
      const dataSourceOptions = layer.options.source
        .options as QueryableDataSourceOptions;
      if (dataSourceOptions.queryTitle) {
        title = this.getLabelMatch(feature, dataSourceOptions.queryTitle);
      }
    }

    return title;
  }

  getLabelMatch(feature: Feature, labelMatch): string {
    let label = labelMatch;
    const labelToGet = Array.from(labelMatch.matchAll(/\$\{([^\{\}]+)\}/g));

    labelToGet.forEach((v) => {
      label = label.replace(v[0], feature.properties[v[1]]);
    });

    // Nothing done? check feature's attribute
    if (labelToGet.length === 0 && label === labelMatch) {
      label = feature.properties[labelMatch] || labelMatch;
    }

    return label;
  }

  /**
   * @param datasource QueryableDataSource
   * @param options QueryOptions
   * @mapExtent extent of the map when click event
   *
   */

  getCustomQueryUrl(
    datasource: QueryableDataSource,
    options: QueryOptions,
    mapExtent?: MapExtent
  ): QueryUrlData[] {
    const extent = olextent.getForViewAndSize(
      options.coordinates,
      options.resolution,
      0,
      [101, 101]
    );

    return datasource.options.queryUrls.map((item) => {
      const data: QueryUrlData = {
        url: item.url
          .replace(/\{bbox\}/g, extent.join(','))
          .replace(/\{x\}/g, options.coordinates[0].toString())
          .replace(/\{y\}/g, options.coordinates[1].toString())
          .replace(/\{resolution\}/g, options.resolution.toString())
          .replace(/\{srid\}/g, options.projection.replace('EPSG:', ''))
      };

      // if the queryFormat changed to "QueryFormat.HTMLGML2": mapExtent will be undefined
      // we need to check "mapExtent" befor replace variables in the url
      if (mapExtent) {
        data.url
          .replace(/\{xmin\}/g, mapExtent[0].toString())
          .replace(/\{ymin\}/g, mapExtent[1].toString())
          .replace(/\{xmax\}/g, mapExtent[2].toString())
          .replace(/\{ymax\}/g, mapExtent[3].toString());
      }

      if (item.maxResolution) {
        data.maxResolution = item.maxResolution;
      }

      if (item.minResolution) {
        data.minResolution = item.minResolution;
      }

      if (item.minScale) {
        data.minScale = item.minScale;
      }

      if (item.maxScale) {
        data.maxScale = item.maxScale;
      }

      return data;
    });
  }
}
