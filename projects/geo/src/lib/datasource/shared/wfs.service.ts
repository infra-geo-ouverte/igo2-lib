import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import olFeature from 'ol/Feature';
import * as olformat from 'ol/format';

import { WFSDataSourceOptions } from './datasources/wfs-datasource.interface';

@Injectable({
  providedIn: 'root'
})
export class WFSService {
  constructor(private http: HttpClient) {}

  public buildBaseWfsUrl(
    wfsDataSourceOptions: WFSDataSourceOptions,
    wfsQuery: string
  ): string {
    let paramTypename = 'typename';
    if (
      wfsDataSourceOptions.params.version === '2.0.0' ||
      !wfsDataSourceOptions.params.version
    ) {
      paramTypename = 'typenames';
    }
    const baseWfsQuery = 'service=wfs&request=' + wfsQuery;
    const wfs_typeName =
      paramTypename + '=' + wfsDataSourceOptions.params.featureTypes;
    const wfsVersion = wfsDataSourceOptions.params.version
      ? 'version=' + wfsDataSourceOptions.params.version
      : 'version=' + '2.0.0';

    return `${
      wfsDataSourceOptions.url
    }?${baseWfsQuery}&${wfsVersion}&${wfs_typeName}`;
  }

  public wfsGetFeature(
    wfsDataSourceOptions: WFSDataSourceOptions,
    nb = 5000,
    epsgCode = 3857,
    propertyname = ''
  ): Observable<any> {
    const base_url = this.buildBaseWfsUrl(wfsDataSourceOptions, 'GetFeature');
    const outputFormat = wfsDataSourceOptions.params.outputFormat
      ? 'outputFormat=' + wfsDataSourceOptions.params.outputFormat
      : '';
    const srsname = wfsDataSourceOptions.params.srsname
      ? 'srsname=' + wfsDataSourceOptions.params.srsname
      : 'srsname=EPSG:' + epsgCode;
    const wfspropertyname =
      propertyname === '' ? propertyname : '&propertyname=' + propertyname;
    let paramMaxFeatures = 'maxFeatures';
    if (
      wfsDataSourceOptions.params.version === '2.0.0' ||
      !wfsDataSourceOptions.params.version
    ) {
      paramMaxFeatures = 'count';
    }

    let maxFeatures;
    if (nb !== 5000) {
      maxFeatures = paramMaxFeatures + '=' + nb;
    } else {
      maxFeatures = wfsDataSourceOptions.params.maxFeatures
        ? paramMaxFeatures + '=' + wfsDataSourceOptions.params.maxFeatures
        : paramMaxFeatures + '=' + nb;
    }
    const url = `${base_url}&${outputFormat}&${srsname}&${maxFeatures}${wfspropertyname}`;
    const patternGml = new RegExp('.*?gml.*?');
    if (
      patternGml.test(wfsDataSourceOptions.params.outputFormat.toLowerCase())
    ) {
      return this.http.get(url, { responseType: 'text' });
    } else {
      return this.http.get(url);
    }
  }

  public getValueFromWfsGetPropertyValues(
    wfsDataSourceOptions: WFSDataSourceOptions,
    field,
    maxFeatures = 30,
    startIndex = 0,
    retry = 0
  ): Observable<any> {
    return new Observable(d => {
      const nb_retry = 2;
      const valueList = [];

      this.wfsGetPropertyValue(
        wfsDataSourceOptions,
        field,
        maxFeatures,
        startIndex
      ).subscribe(
        str => {
          str = str.replace(/&#39;/gi, "'"); // tslint:disable-line
          const regex_excp = /exception/gi;
          if (regex_excp.test(str)) {
            retry++;
            if (retry < nb_retry) {
              this.getValueFromWfsGetPropertyValues(
                wfsDataSourceOptions,
                field,
                maxFeatures,
                startIndex,
                retry
              ).subscribe(rep => d.next(rep));
            }
          } else {
            const valueReference_regex = new RegExp(
              '<(.+?)' + field + '>(.+?)</(.+?)' + field + '>',
              'gi'
            );
            let n;
            while ((n = valueReference_regex.exec(str)) !== null) {
              if (n.index === valueReference_regex.lastIndex) {
                valueReference_regex.lastIndex++;
              }
              if (valueList.indexOf(n[2]) === -1) {
                valueList.push(n[2]);
              }
            }
            d.next(valueList);
            d.complete();
          }
        },
        err => {
          if (retry < nb_retry) {
            retry++;
            this.getValueFromWfsGetPropertyValues(
              wfsDataSourceOptions,
              field,
              maxFeatures,
              startIndex,
              retry
            ).subscribe(rep => d.next(rep));
          }
        }
      );
    });
  }

  wfsGetCapabilities(options): Observable<any> {
    const baseWfsQuery = 'service=wfs&request=GetCapabilities';
    const wfsVersion = options.version
      ? 'version=' + options.version
      : 'version=' + '2.0.0';
    const wfs_gc_url = `${options.url}?${baseWfsQuery}&${wfsVersion}`;
    return this.http.get(wfs_gc_url, {
      observe: 'response',
      responseType: 'text'
    });
  }

  defineFieldAndValuefromWFS(
    wfsDataSourceOptions: WFSDataSourceOptions
  ): Observable<any> {
    return new Observable(d => {
      const sourceFields = [];
      let fieldList;
      let fieldListWoGeom;
      let fieldListWoGeomStr;
      let olFormats;
      const patternGml3 = /gml/gi;
      if (wfsDataSourceOptions.params.outputFormat.match(patternGml3)) {
        olFormats = olformat.WFS;
      } else {
        olFormats = olformat.GeoJSON;
      }

      if (wfsDataSourceOptions['wfsCapabilities']['GetPropertyValue']) {
        this.wfsGetFeature(wfsDataSourceOptions, 1).subscribe(oneFeature => {
          const features = new olFormats().readFeatures(oneFeature);
          fieldList = features[0].getKeys();
          fieldListWoGeom = fieldList.filter(
            field =>
              field !== features[0].getGeometryName() &&
              !field.match(/boundedby/gi)
          );
          fieldListWoGeomStr = fieldListWoGeom.join(',');
          fieldListWoGeom.forEach(element => {
            const fieldType =
              typeof features[0].get(element) === 'object'
                ? undefined
                : typeof features[0].get(element);
            this.getValueFromWfsGetPropertyValues(
              wfsDataSourceOptions,
              element,
              200
            ).subscribe(valueList => {
              sourceFields.push({
                name: element,
                alias: element,
                type: fieldType,
                values: valueList
              });
              d.next(sourceFields);
            });
          });
        });
      } else {
        this.wfsGetFeature(wfsDataSourceOptions, 1).subscribe(oneFeature => {
          const features = new olFormats().readFeatures(oneFeature);
          fieldList = features[0].getKeys();
          fieldListWoGeom = fieldList.filter(
            field =>
              field !== features[0].getGeometryName() &&
              !field.match(/boundedby/gi)
          );
          fieldListWoGeomStr = fieldListWoGeom.join(',');
          this.wfsGetFeature(
            wfsDataSourceOptions,
            200,
            3857,
            fieldListWoGeomStr
          ).subscribe(manyFeatures => {
            const mfeatures = new olFormats().readFeatures(manyFeatures);
            this.built_properties_value(mfeatures).forEach(element => {
              sourceFields.push(element);
            });
            d.next(sourceFields);
            d.complete();
          });
        });
      }
    });
  }

  public wfsGetPropertyValue(
    wfsDataSourceOptions: WFSDataSourceOptions,
    field,
    maxFeatures = 30,
    startIndex = 0
  ): Observable<any> {
    const baseWfsQuery =
      'service=wfs&request=GetPropertyValue&count=' + maxFeatures;
    const wfs_typeName =
      'typenames=' + wfsDataSourceOptions.params.featureTypes;
    const wfsValueReference = 'valueReference=' + field;
    const wfsVersion = 'version=' + '2.0.0';
    // tslint:disable-next-line:max-line-length
    const gfv_url = `${
      wfsDataSourceOptions.url
    }?${baseWfsQuery}&${wfsVersion}&${wfs_typeName}&${wfsValueReference}`;
    return this.http.get(gfv_url, { responseType: 'text' });
  }

  private built_properties_value(features: olFeature[]): string[] {
    const kv = Object.assign({}, features[0].getProperties());
    delete kv[features[0].getGeometryName()];
    delete kv['boundedBy'];
    const sourceFields = [];
    for (const property in kv) {
      if (kv.hasOwnProperty(property)) {
        const fieldType =
          typeof features[0].get(property) === 'object'
            ? undefined
            : typeof features[0].get(property);
        sourceFields.push({
          name: property,
          alias: property,
          type: fieldType,
          values: [kv[property]]
        });
      }
    }
    features.every(function(element) {
      const feature_properties = element.getProperties();
      for (const key in feature_properties) {
        if (feature_properties.hasOwnProperty(key) && key in kv) {
          sourceFields.filter(f => f.name === key).forEach(v => {
            if (v.values.indexOf(feature_properties[key]) === -1) {
              v.values.push(feature_properties[key]);
            }
          });
        }
      }
      return true;
    });
    return sourceFields;
  }
}
