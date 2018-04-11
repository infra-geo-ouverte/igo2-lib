import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import * as ol from 'openlayers';

import { OgcFiltersOptions } from '../../../filter/shared';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { DataService } from './data.service';


@Injectable()
export class WFSDataSourceService extends DataService {

  constructor(private http: HttpClient) {
    super();
  }

  getData() {
    console.log('This is defining a datasource service.');
    return 'This is defining a datasource service.'
  }

  public getFormatFromOptions(options: WFSDataSourceOptions) {
    let olFormatCls;
    const outputFormat = options.outputFormat.toLowerCase()
    const patternGml3 = new RegExp('.*?gml.*?');
    const patternGeojson = new RegExp('.*?json.*?');

    if (patternGeojson.test(outputFormat)) {
      olFormatCls = ol.format.GeoJSON;
    }
    if (patternGml3.test(outputFormat)) {
      olFormatCls = ol.format.WFS;
    }

    return new olFormatCls();
  }

  public checkWfsOptions(wfsDataSourceOptions: WFSDataSourceOptions): WFSDataSourceOptions {
    const mandatoryParamMissing: any[] = [];

    ['url', 'featureTypes', 'fieldNameGeometry'].forEach(element => {
      if (wfsDataSourceOptions[element] === undefined) {
        mandatoryParamMissing.push(element)
      }
    });

    if (mandatoryParamMissing.length > 0) {
      throw new Error(`A mandatory parameter is missing
        for your WFS datasource source.
        (Mandatory parameter(s) missing :` + mandatoryParamMissing);
    }

    // Look at https://github.com/openlayers/openlayers/pull/6400
    const patternGml = new RegExp('.*?gml.*?');

    if (patternGml.test(wfsDataSourceOptions.outputFormat)) {
      wfsDataSourceOptions.version = '1.1.0';
    }

    wfsDataSourceOptions.ogcFilters = wfsDataSourceOptions.ogcFilters === undefined ?
      { filtersAreEditable: true, filters: undefined } as OgcFiltersOptions :
      wfsDataSourceOptions.ogcFilters;

    return Object.assign({}, wfsDataSourceOptions, {
      'wfsCapabilities': { 'xml': '', 'GetPropertyValue': false }
    });
  }

  public buildBaseWfsUrl(wfsDataSourceOptions: WFSDataSourceOptions, wfsQuery: string) {
    let paramTypename = 'typename';
    if (wfsDataSourceOptions.version === '2.0.0' || !wfsDataSourceOptions.version) {
      paramTypename = 'typenames';
    }
    const baseWfsQuery = 'service=wfs&request=' + wfsQuery;
    const wfs_typeName = paramTypename + '=' + wfsDataSourceOptions.featureTypes;
    const wfsVersion = wfsDataSourceOptions.version
      ? 'version=' + wfsDataSourceOptions.version : 'version=' + '2.0.0';

    return `${wfsDataSourceOptions.url}?${baseWfsQuery}&${wfsVersion}&${wfs_typeName}`;
  }

  public wfsGetFeature(wfsDataSourceOptions: WFSDataSourceOptions,
    nb = 5000, epsgCode = 3857, propertyname = ''): Observable<any> {

    const base_url = this.buildBaseWfsUrl(wfsDataSourceOptions, 'GetFeature');
    const outputFormat = wfsDataSourceOptions.outputFormat ?
      'outputFormat=' + wfsDataSourceOptions.outputFormat : '';
    const srsname = wfsDataSourceOptions.srsname ?
      'srsname=' + wfsDataSourceOptions.srsname : 'srsname=EPSG:' + epsgCode;
    const wfspropertyname = propertyname === '' ? propertyname : '&propertyname=' + propertyname;
    let paramMaxFeatures = 'maxFeatures';
    if (wfsDataSourceOptions.version === '2.0.0' || !wfsDataSourceOptions.version) {
      paramMaxFeatures = 'count';
    }

    let maxFeatures;
    if (nb !== 5000) {
      maxFeatures = paramMaxFeatures + '=' + nb;
    } else {
      maxFeatures = wfsDataSourceOptions.maxFeatures ?
        paramMaxFeatures + '=' + wfsDataSourceOptions.maxFeatures : paramMaxFeatures + '=' + nb;
    }
    const url = `${base_url}&${outputFormat}&${srsname}&${maxFeatures}${wfspropertyname}`;
    const patternGml = new RegExp('.*?gml.*?');
    if (patternGml.test(wfsDataSourceOptions.outputFormat.toLowerCase())) {
      return this.http.get(url, { responseType: 'text' });
    } else {
      return this.http.get(url);
    }
  }

  public getValueFromWfsGetPropertyValues(wfsDataSourceOptions: WFSDataSourceOptions,
    field, maxFeatures = 30, startIndex = 0, retry = 0) {
    const nb_retry = 2;
    let valueList = [];

    this.wfsGetPropertyValue(wfsDataSourceOptions, field, maxFeatures, startIndex)
      .subscribe(
        (str) => {
          str = str.replace(/&#39;/gi, '\'');
          const regex_excp = /exception/gi;
          if (regex_excp.test(str)) {
            retry++;
            if (retry < nb_retry) {
              valueList = this.getValueFromWfsGetPropertyValues(
                wfsDataSourceOptions, field, maxFeatures, startIndex, retry);
            }
          } else {
            const valueReference_regex =
              new RegExp('<(.+?)' + field + '>(.+?)<\/(.+?)' + field + '>', 'gi');
            let n;
            while ((n = valueReference_regex.exec(str)) !== null) {
              if (n.index === valueReference_regex.lastIndex) {
                valueReference_regex.lastIndex++;
              }
              if (valueList.indexOf(n[2]) === -1) {
                valueList.push(n[2]);
              }
            }
          }
        },
        (err) => {
          if (retry < nb_retry) {
            retry++;
            valueList = this.getValueFromWfsGetPropertyValues(
              wfsDataSourceOptions, field, maxFeatures, startIndex, retry);
          }
        }
      );
    return valueList;
  }

  wfsGetCapabilities(options): Observable<any> {
    const baseWfsQuery = 'service=wfs&request=GetCapabilities';
    const wfsVersion = options.version
      ? 'version=' + options.version : 'version=' + '2.0.0';
    const wfs_gc_url = `${options.url}?${baseWfsQuery}&${wfsVersion}`;
    return this.http.get(wfs_gc_url, { observe: 'response', responseType: 'text' });
  }

  defineFieldAndValuefromWFS(wfsDataSourceOptions: WFSDataSourceOptions) {
    const sourceFields = [];
    let fieldList;
    let fieldListWoGeom;
    let fieldListWoGeomStr;
    let olFormats;
    const patternGml3 = /gml/gi;
    if (wfsDataSourceOptions.outputFormat.match(patternGml3)) {
      olFormats = ol.format.WFS;
    } else {
      olFormats = ol.format.GeoJSON;
    }
    if (wfsDataSourceOptions['wfsCapabilities']['GetPropertyValue']) {
      this.wfsGetFeature(wfsDataSourceOptions, 1).subscribe((oneFeature) => {
        const features = new olFormats().readFeatures(oneFeature);
        fieldList = features[0].getKeys();
        fieldListWoGeom = fieldList
          .filter((field) => field !== features[0]
            .getGeometryName() && !field.match(/boundedby/gi));
        fieldListWoGeomStr = fieldListWoGeom.join(',');
        fieldListWoGeom.forEach(element => {
          const fieldType = typeof features[0]
            .get(element) === 'object' ? undefined : typeof features[0].get(element);
          const valueList = this.getValueFromWfsGetPropertyValues(
            wfsDataSourceOptions, element, 200);
          sourceFields.push(
            {
              'name': element,
              'alias': element,
              'type': fieldType,
              'values': valueList
            });
        });
      });
    } else {
      this.wfsGetFeature(wfsDataSourceOptions, 1).subscribe((oneFeature) => {
        const features = new olFormats().readFeatures(oneFeature);
        fieldList = features[0].getKeys();
        fieldListWoGeom = fieldList
          .filter((field) => field !== features[0]
            .getGeometryName() && !field.match(/boundedby/gi));
        fieldListWoGeomStr = fieldListWoGeom.join(',');
        this.wfsGetFeature(wfsDataSourceOptions, 200, 3857, fieldListWoGeomStr)
          .subscribe((manyFeatures) => {
            const mfeatures = new olFormats().readFeatures(manyFeatures);
            this.built_properties_value(mfeatures).forEach(element => {
              sourceFields.push(element);
            });
          });
      });
    }
    return sourceFields;
  }

  private built_properties_value(features: ol.Feature[]): any[] {
    const kv = Object.assign({}, features[0].getProperties());
    delete kv[features[0].getGeometryName()];
    delete kv['boundedBy'];
    const sourceFields = [];
    for (const property in kv) {
      if (kv.hasOwnProperty(property)) {
        const fieldType = typeof features[0]
          .get(property) === 'object' ? undefined : typeof features[0].get(property);
        sourceFields.push(
          {
            'name': property,
            'alias': property,
            'type': fieldType,
            'values': [kv[property]]
          });
      }
    }
    features.every(function(element) {
      const feature_properties = element.getProperties();
      for (const key in feature_properties) {
        if (feature_properties.hasOwnProperty(key) && key in kv) {
          sourceFields.filter((f) => f.name === key).forEach(v => {
            if (v.values.indexOf(feature_properties[key]) === -1) {
              v.values.push(feature_properties[key]);
            }
          });
        }
      }
      return true;
    })
    return sourceFields;
  }

  public wfsGetPropertyValue(
    wfsDataSourceOptions: WFSDataSourceOptions,
    field, maxFeatures = 30,
    startIndex = 0) {
    const baseWfsQuery = 'service=wfs&request=GetPropertyValue&count=' + maxFeatures;
    const wfs_typeName = 'typenames=' + wfsDataSourceOptions.featureTypes;
    const wfsValueReference = 'valueReference=' + field;
    const wfsVersion = 'version=' + '2.0.0';
    // tslint:disable-next-line:max-line-length
    const gfv_url = `${wfsDataSourceOptions.url}?${baseWfsQuery}&${wfsVersion}&${wfs_typeName}&${wfsValueReference}`;
    return this.http.get(gfv_url, { responseType: 'text' });
  }
}
