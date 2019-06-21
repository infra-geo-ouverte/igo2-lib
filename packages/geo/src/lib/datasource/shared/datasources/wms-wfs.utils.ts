import { WFSDataSourceOptions } from './wfs-datasource.interface';

export const defaultEpsg = 'EPSG:3857';
export const defaultMaxFeatures = 5000;
export const defaultWfsVersion = '2.0.0';
export const defaultFieldNameGeometry = 'geometry';
export const gmlRegex = new RegExp(/.*?gml.*?/gi);
export const jsonRegex = new RegExp(/.*?json.*?/gi);

/**
 * This method build/standardize WFS call query params based on the layer property.
 * @param wfsDataSourceOptions  WFSDataSourceOptions The common wfs datasource options interface
 * @param count  Number: Used to control the number of feature. Used to bypass whe wfs datasource options interface (maxFeatures)
 * @param epsg  String: Used to control the EPSG code (es: 'EPSG3857'). Used to bypass whe wfs datasource options interface (srsName)
 * @param properties  String: Used to control the queried fields  (WFS service).
 * @returns An array array of {name: '', value: ''} of predefined query params.
 */
export function formatWFSQueryString(
    wfsDataSourceOptions: WFSDataSourceOptions,
    count?: number,
    epsg?: string,
    properties?: string): { name: string, value: string }[] {

    const versionWfs200 = '2.0.0'; // not the same usage as defaultWfsVersion.
    const url = wfsDataSourceOptions.urlWfs;
    const paramsWFS = wfsDataSourceOptions.paramsWFS;
    const effectiveCount = count || defaultMaxFeatures;
    const epsgCode = epsg || defaultEpsg;
    const outputFormat = paramsWFS.outputFormat ? `outputFormat=${paramsWFS.outputFormat}` : '';
    const version = paramsWFS.version ? `version=${paramsWFS.version}` : `version=${defaultWfsVersion}`;
    const paramTypename = paramsWFS.version === versionWfs200 ? 'typenames' : 'typename';
    const featureTypes = `${paramTypename}=${paramsWFS.featureTypes}`;
    const paramMaxFeatures = paramsWFS.version === versionWfs200 ? 'count' : 'maxFeatures';
    const cnt = count ? `${paramMaxFeatures}=${effectiveCount}` :
        paramsWFS.maxFeatures ? `${paramMaxFeatures}=${paramsWFS.maxFeatures}` : `${paramMaxFeatures}=${effectiveCount}`;
    const srs = epsg ? `srsname=${epsgCode}` : paramsWFS.srsName ? 'srsname=' + paramsWFS.srsName : `srsname=${epsgCode}`;

    let propertyName = '';
    let valueReference = '';
    if (properties) {
        propertyName = `propertyName=${properties}`;
        valueReference = `valueReference=${properties}`;
    }
    const sourceFields = wfsDataSourceOptions.sourceFields;
    if (!propertyName && sourceFields && sourceFields.length > 0) {
        const fieldsNames = [];
        wfsDataSourceOptions.sourceFields.forEach(sourcefield => {
            fieldsNames.push(sourcefield.name);
        });
        propertyName = `propertyName=${fieldsNames.join(',')},${paramsWFS.fieldNameGeometry}`;
    }

    const getCapabilities = `${url}?service=wfs&request=GetCapabilities&${version}`;
    let getFeature = `${url}?service=wfs&request=GetFeature&${version}&${featureTypes}&`;
    getFeature += `${outputFormat}&${srs}&${cnt}&${propertyName}`;

    let getpropertyvalue = `${url}?service=wfs&request=GetPropertyValue&version=${versionWfs200}&${featureTypes}&`;
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
 * Validate/Modify layer's wfs options based on an Openlayers's issue with GML provided from WFS. Refer to
 * https://github.com/openlayers/openlayers/pull/6400
 * @param wfsDataSourceOptions  WFSDataSourceOptions The common wfs datasource options interface
 * @returns An array array of {name: '', value: ''} of predefined query params.
 */
export function checkWfsParams(wfsDataSourceOptions) {
    let outputFormat;
    if (wfsDataSourceOptions.paramsWFS.outputFormat) {
      outputFormat = wfsDataSourceOptions.paramsWFS.outputFormat;
    }

    if (gmlRegex.test(outputFormat) || !outputFormat) {
      wfsDataSourceOptions.paramsWFS.version = '1.1.0';
    }
    return Object.assign({}, wfsDataSourceOptions, {
      wfsCapabilities: { xmlBody: '', GetPropertyValue: false }
    });
  }
