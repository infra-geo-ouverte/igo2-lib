import { Extent } from 'ol/extent';
import * as OlFormat from 'ol/format';
import olFormatGML2 from 'ol/format/GML2';
import olFormatGML3 from 'ol/format/GML3';
import olFormatGML32 from 'ol/format/GML32';
import olFormatOSMXML from 'ol/format/OSMXML';
import olProjection from 'ol/proj/Projection';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import { OgcFiltersOptions } from '../../../filter/shared/ogc-filter.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';

export const defaultEpsg = 'EPSG:3857';
export const defaultMaxFeatures = 5000;
export const defaultWfsVersion = '2.0.0';
export const defaultFieldNameGeometry = 'geometry';
export const gmlRegex = new RegExp(/(.*)?gml(.*)?/gi);
export const jsonRegex = new RegExp(/(.*)?json(.*)?/gi);

/**
 * This method build the WFS URL based on the layer property.
 * @param options  WFSDataSourceOptions The common wfs datasource options interface
 * @param extent  An extent like array [number, number, number, number]
 * @param proj  olProjection
 * @param ogcFilters  OgcFiltersOptions
 * @returns A string representing the datasource options, based on filter and views
 */
export function buildUrl(
  options: WFSDataSourceOptions,
  extent: Extent,
  proj: olProjection,
  ogcFilters: OgcFiltersOptions,
  randomParam?: boolean
): string {
  const paramsWFS = options.paramsWFS;
  const queryStringValues = formatWFSQueryString(
    options,
    undefined,
    options.paramsWFS.srsName
  );
  let igoFilters;
  if (ogcFilters?.enabled) {
    igoFilters = ogcFilters?.filters;
  }
  const ogcFilterWriter = new OgcFilterWriter();
  const filterOrBox = ogcFilterWriter.buildFilter(
    igoFilters,
    extent,
    proj,
    ogcFilters?.geometryName,
    options
  );
  let filterOrPush = ogcFilterWriter.handleOgcFiltersAppliedValue(
    options,
    ogcFilters?.geometryName,
    extent,
    proj
  );

  let prefix = 'filter';
  if (extent && !filterOrPush) {
    prefix = 'bbox';
    filterOrPush = extent.join(',') + ',' + proj.getCode();
  }

  if (ogcFilters?.advancedOgcFilters || filterOrPush) {
    paramsWFS.xmlFilter = ogcFilters?.advancedOgcFilters
      ? filterOrBox
      : `${prefix}=${filterOrPush}`;
  }

  let baseUrl = queryStringValues.find((f) => f.name === 'getfeature').value;
  const patternFilter = /(filter|bbox)=.*/gi;
  baseUrl = patternFilter.test(paramsWFS.xmlFilter)
    ? `${baseUrl}&${paramsWFS.xmlFilter}`
    : baseUrl;
  options.download = Object.assign({}, options.download, {
    dynamicUrl: baseUrl
  });
  if (randomParam) {
    baseUrl += `$&_t${new Date().getTime()}`;
  }
  return baseUrl.replace(/&&/g, '&');
}

/**
 * This method build/standardize WFS call query params based on the layer property.
 * @param wfsDataSourceOptions  WFSDataSourceOptions The common wfs datasource options interface
 * @param count  Number: Used to control the number of feature. Used to bypass whe wfs datasource options interface (maxFeatures)
 * @param epsg  String: Used to control the EPSG code (es: 'EPSG3857'). Used to bypass whe wfs datasource options interface (srsName)
 * @param properties  String: Used to control the queried fields  (WFS service).
 * @returns An array array of {name: '', value: ''} of predefined query params.
 */
export function formatWFSQueryString(
  dataSourceOptions: WFSDataSourceOptions | WMSDataSourceOptions,
  count?: number,
  epsg?: string,
  properties?: string,
  startIndex = 0,
  forceDefaultOutputFormat = false
): { name: string; value: string }[] {
  const versionWfs200 = '2.0.0'; // not the same usage as defaultWfsVersion.
  const url = dataSourceOptions.urlWfs;
  const paramsWFS = dataSourceOptions.paramsWFS;
  const effectiveCount = count || defaultMaxFeatures;
  const effectiveStartIndex =
    paramsWFS.version === versionWfs200 ? `startIndex=${startIndex}` : '';
  const epsgCode = epsg || defaultEpsg;
  let outputFormat = paramsWFS.outputFormat
    ? `outputFormat=${paramsWFS.outputFormat}`
    : '';
  let version = paramsWFS.version
    ? `version=${paramsWFS.version}`
    : `version=${defaultWfsVersion}`;
  const paramTypename =
    paramsWFS.version === versionWfs200 ? 'typenames' : 'typename';
  const featureTypes = `${paramTypename}=${paramsWFS.featureTypes}`;
  const paramMaxFeatures =
    paramsWFS.version === versionWfs200 ? 'count' : 'maxFeatures';
  let cnt = count
    ? `${paramMaxFeatures}=${effectiveCount}`
    : paramsWFS.maxFeatures
      ? `${paramMaxFeatures}=${paramsWFS.maxFeatures}`
      : `${paramMaxFeatures}=${effectiveCount}`;
  if (forceDefaultOutputFormat) {
    outputFormat = '';
    version = 'version=1.1.0';
    cnt = cnt.replace('count', 'maxFeatures');
  }

  const srs = epsg
    ? `srsname=${epsgCode}`
    : paramsWFS.srsName
      ? 'srsname=' + paramsWFS.srsName
      : `srsname=${epsgCode}`;

  let propertyName = '';
  let valueReference = '';
  if (properties) {
    propertyName = `propertyName=${properties}`;
    valueReference = `valueReference=${properties}`;
  }
  const sourceFields = dataSourceOptions.sourceFields;
  if (!propertyName && sourceFields && sourceFields.length > 0) {
    const fieldsNames = [];
    dataSourceOptions.sourceFields.forEach((sourcefield) => {
      fieldsNames.push(sourcefield.name);
    });
    propertyName = `propertyName=${fieldsNames.join(',')},${
      paramsWFS.fieldNameGeometry
    }`;
  }

  const separator = url.indexOf('?') === -1 ? '?' : '&';
  const getCapabilities = `${url}${separator}service=WFS&request=GetCapabilities&${version}`;
  let getFeature = `${url}${separator}service=WFS&request=GetFeature&${version}&${featureTypes}&`;
  getFeature += `${outputFormat}&${srs}&${cnt}&${propertyName}&${effectiveStartIndex}`;

  let getpropertyvalue = `${url}?service=WFS&request=GetPropertyValue&version=${versionWfs200}&${featureTypes}&`;
  getpropertyvalue += `&${cnt}&${valueReference}`;

  return [
    { name: 'outputformat', value: outputFormat },
    { name: 'version', value: version },
    { name: 'typename', value: featureTypes },
    { name: 'count', value: cnt },
    { name: 'srsname', value: srs },
    { name: 'propertyname', value: propertyName },
    { name: 'valuereference', value: valueReference },
    { name: 'getcapabilities', value: getCapabilities.replace(/&&/g, '&') },
    { name: 'getfeature', value: getFeature.replace(/&&/g, '&') },
    { name: 'getpropertyvalue', value: getpropertyvalue.replace(/&&/g, '&') }
  ];
}

/**
 * Validate/Modify layer's wfs options based on :
 * 1- an Openlayers's issue with GML provided from WFS. Refer to
 * https://github.com/openlayers/openlayers/pull/6400
 * 2- Set default values for optionals parameters.
 * @param wfsDataSourceOptions  WFSDataSourceOptions The common wfs datasource options interface
 * @returns An array array of {name: '', value: ''} of predefined query params.
 */
export function checkWfsParams(wfsDataSourceOptions, srcType?: string) {
  if (srcType && srcType === 'wfs') {
    // reassignation of params to paramsWFS and url to urlWFS to have a common interface with wms-wfs datasources
    wfsDataSourceOptions.paramsWFS = wfsDataSourceOptions.params;
  }

  const paramsWFS = wfsDataSourceOptions.paramsWFS;
  wfsDataSourceOptions.urlWfs =
    wfsDataSourceOptions.urlWfs || wfsDataSourceOptions.url;

  paramsWFS.version = paramsWFS.version || defaultWfsVersion;
  paramsWFS.fieldNameGeometry =
    paramsWFS.fieldNameGeometry || defaultFieldNameGeometry;
  paramsWFS.maxFeatures = paramsWFS.maxFeatures || defaultMaxFeatures;

  let outputFormat;
  if (paramsWFS.outputFormat) {
    outputFormat = paramsWFS.outputFormat;
  }

  if (gmlRegex.test(outputFormat) || !outputFormat) {
    paramsWFS.version = '1.1.0';
  }
  return Object.assign({}, wfsDataSourceOptions);
}

export function getFormatFromOptions(
  options: WFSDataSourceOptions | WMSDataSourceOptions
) {
  const wfsOptions = options as WFSDataSourceOptions;

  let olFormatCls;
  const outputFormat = wfsOptions.paramsWFS.outputFormat
    ? wfsOptions.paramsWFS.outputFormat
    : undefined;

  if (!outputFormat) {
    olFormatCls = OlFormat.WFS;
    return new olFormatCls(wfsOptions.formatOptions);
  }

  if (OlFormat[outputFormat]) {
    olFormatCls = OlFormat[outputFormat];
    return new olFormatCls(wfsOptions.formatOptions);
  } else if (outputFormat.toLowerCase().match('gml2')) {
    olFormatCls = OlFormat.WFS;
    return new olFormatCls({
      ...wfsOptions.formatOptions,
      ...{ gmlFormat: olFormatGML2 }
    });
  } else if (outputFormat.toLowerCase().match('gml32')) {
    olFormatCls = OlFormat.WFS;
    return new olFormatCls({
      ...wfsOptions.formatOptions,
      ...{ gmlFormat: olFormatGML32 }
    });
  } else if (outputFormat.toLowerCase().match('gml3')) {
    olFormatCls = OlFormat.WFS;
    return new olFormatCls({
      ...wfsOptions.formatOptions,
      ...{ gmlFormat: olFormatGML3 }
    });
  } else if (outputFormat.toLowerCase().match('topojson')) {
    olFormatCls = OlFormat.TopoJSON;
    return new olFormatCls(wfsOptions.formatOptions);
  } else if (outputFormat.toLowerCase().match('geojson')) {
    olFormatCls = OlFormat.GeoJSON;
    return new olFormatCls(wfsOptions.formatOptions);
  } else if (outputFormat.toLowerCase().match('esrijson')) {
    olFormatCls = OlFormat.EsriJSON;
    return new olFormatCls(wfsOptions.formatOptions);
  } else if (outputFormat.toLowerCase().match('json')) {
    olFormatCls = OlFormat.GeoJSON;
    return new olFormatCls(wfsOptions.formatOptions);
  } else if (outputFormat.toLowerCase().match('gpx')) {
    olFormatCls = OlFormat.GPX;
    return new olFormatCls(wfsOptions.formatOptions);
  } else if (outputFormat.toLowerCase().match('WKT')) {
    olFormatCls = OlFormat.WKT;
    return new olFormatCls(wfsOptions.formatOptions);
  } else if (outputFormat.toLowerCase().match('osmxml')) {
    olFormatCls = olFormatOSMXML;
    return new olFormatCls(wfsOptions.formatOptions);
  } else if (outputFormat.toLowerCase().match('kml')) {
    olFormatCls = OlFormat.KML;
    return new olFormatCls(wfsOptions.formatOptions);
  }

  return new olFormatCls();
}
