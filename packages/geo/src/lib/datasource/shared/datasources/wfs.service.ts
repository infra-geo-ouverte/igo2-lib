import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import olFeature from 'ol/Feature';
import * as olformat from 'ol/format';

import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class WFSService extends DataService {
  constructor(private http: HttpClient) {
    super();
  }

  getData() {
    console.log('This is defining a data service.');
    return 'This is defining a data service.';
  }

  public getSourceFieldsFromWFS(datasource) {
    if (
      datasource.sourceFields === undefined ||
      Object.keys(datasource.sourceFields).length === 0
    ) {
      datasource.sourceFields = [];
      this.wfsGetCapabilities(datasource).subscribe(wfsCapabilities => {
        datasource.paramsWFS.wfsCapabilities = {
          xmlBody: wfsCapabilities.body,
          GetPropertyValue: /GetPropertyValue/gi.test(wfsCapabilities.body)
            ? true
            : false
        };

        this.defineFieldAndValuefromWFS(datasource).subscribe(sourceFields => {
          datasource.sourceFields = sourceFields;
        });
      });
    } else {
      datasource.sourceFields.forEach(sourcefield => {
        if (sourcefield.alias === undefined) {
          sourcefield.alias = sourcefield.name; // to allow only a list of sourcefield with names
        }
      });

      datasource.sourceFields
        .filter(
          field => field.values === undefined || field.values.length === 0
        )
        .forEach(f => {
          this.getValueFromWfsGetPropertyValues(
            datasource,
            f.name,
            200,
            0,
            0
          ).subscribe(rep => (f.values = rep));
        });
    }
  }

  public checkWfsOptions(wfsDataSourceOptions) {
    // Look at https://github.com/openlayers/openlayers/pull/6400
    const patternGml = new RegExp(/.*?gml.*?/gi);

    if (patternGml.test(wfsDataSourceOptions.paramsWFS.outputFormat)) {
      wfsDataSourceOptions.paramsWFS.version = '1.1.0';
    }
    return Object.assign({}, wfsDataSourceOptions, {
      wfsCapabilities: { xmlBody: '', GetPropertyValue: false }
    });
  }

  public buildBaseWfsUrl(
    wfsDataSourceOptions: WFSDataSourceOptions,
    wfsQuery: string
  ): string {
    let paramTypename = 'typename';
    if (
      wfsDataSourceOptions.paramsWFS.version === '2.0.0' ||
      !wfsDataSourceOptions.paramsWFS.version
    ) {
      paramTypename = 'typenames';
    }
    const baseWfsQuery = 'service=wfs&request=' + wfsQuery;
    const wfsTypeName =
      paramTypename + '=' + wfsDataSourceOptions.paramsWFS.featureTypes;
    const wfsVersion = wfsDataSourceOptions.paramsWFS.version
      ? 'version=' + wfsDataSourceOptions.paramsWFS.version
      : 'version=' + '2.0.0';

    return `${
      wfsDataSourceOptions.urlWfs
    }?${baseWfsQuery}&${wfsVersion}&${wfsTypeName}`;
  }

  public wfsGetFeature(
    wfsDataSourceOptions: WFSDataSourceOptions,
    nb = 5000,
    epsgCode = 3857,
    propertyname = ''
  ): Observable<any> {
    const baseUrl = this.buildBaseWfsUrl(wfsDataSourceOptions, 'GetFeature');
    const outputFormat = wfsDataSourceOptions.paramsWFS.outputFormat
      ? 'outputFormat=' + wfsDataSourceOptions.paramsWFS.outputFormat
      : '';
    const srsname = wfsDataSourceOptions.paramsWFS.srsName
      ? 'srsname=' + wfsDataSourceOptions.paramsWFS.srsName
      : 'srsname=EPSG:' + epsgCode;
    const wfspropertyname =
      propertyname === '' ? propertyname : '&propertyname=' + propertyname;
    let paramMaxFeatures = 'maxFeatures';
    if (
      wfsDataSourceOptions.paramsWFS.version === '2.0.0' ||
      !wfsDataSourceOptions.paramsWFS.version
    ) {
      paramMaxFeatures = 'count';
    }

    let maxFeatures;
    if (nb !== 5000) {
      maxFeatures = paramMaxFeatures + '=' + nb;
    } else {
      maxFeatures = wfsDataSourceOptions.paramsWFS.maxFeatures
        ? paramMaxFeatures + '=' + wfsDataSourceOptions.paramsWFS.maxFeatures
        : paramMaxFeatures + '=' + nb;
    }
    const urlWfs = `${baseUrl}&${outputFormat}&${srsname}&${maxFeatures}${wfspropertyname}`;
    const patternGml = new RegExp('.*?gml.*?');
    if (
      patternGml.test(wfsDataSourceOptions.paramsWFS.outputFormat.toLowerCase())
    ) {
      return this.http.get(urlWfs, { responseType: 'text' });
    } else {
      return this.http.get(urlWfs);
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
      const nbRetry = 2;
      const valueList = [];

      this.wfsGetPropertyValue(
        wfsDataSourceOptions,
        field,
        maxFeatures,
        startIndex
      ).subscribe(
        str => {
          str = str.replace(/&#39;/gi, "'"); // tslint:disable-line
          const regexExcp = /exception/gi;
          if (regexExcp.test(str)) {
            retry++;
            if (retry < nbRetry) {
              this.getValueFromWfsGetPropertyValues(
                wfsDataSourceOptions,
                field,
                maxFeatures,
                startIndex,
                retry
              ).subscribe(rep => d.next(rep));
            }
          } else {
            const valueReferenceRegex = new RegExp(
              '<(.+?)' + field + '>(.+?)</(.+?)' + field + '>',
              'gi'
            );
            let n = valueReferenceRegex.exec(str);
            while (n !== null) {
              if (n.index === valueReferenceRegex.lastIndex) {
                valueReferenceRegex.lastIndex++;
              }
              if (valueList.indexOf(n[2]) === -1) {
                valueList.push(n[2]);
              }
              n = valueReferenceRegex.exec(str);
            }
            d.next(valueList);
            d.complete();
          }
        },
        err => {
          if (retry < nbRetry) {
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
    const wfsGcUrl = `${options.urlWfs}?${baseWfsQuery}&${wfsVersion}`;
    return this.http.get(wfsGcUrl, {
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
      if (wfsDataSourceOptions.paramsWFS.outputFormat.match(patternGml3)) {
        olFormats = olformat.WFS;
      } else {
        olFormats = olformat.GeoJSON;
      }

      if (wfsDataSourceOptions.paramsWFS.wfsCapabilities.GetPropertyValue) {
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
    const wfsTypeName =
      'typenames=' + wfsDataSourceOptions.paramsWFS.featureTypes;
    const wfsValueReference = 'valueReference=' + field;
    const wfsVersion = 'version=' + '2.0.0';
    const gfvUrl = `${
      wfsDataSourceOptions.urlWfs
    }?${baseWfsQuery}&${wfsVersion}&${wfsTypeName}&${wfsValueReference}`;
    return this.http.get(gfvUrl, { responseType: 'text' });
  }

  private built_properties_value(features: olFeature[]): string[] {
    const kv = Object.assign({}, features[0].getProperties());
    delete kv[features[0].getGeometryName()];
    delete kv.boundedBy;
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
    features.every((element) => {
      const featureProperties = element.getProperties();
      for (const key in featureProperties) {
        if (featureProperties.hasOwnProperty(key) && key in kv) {
          sourceFields.filter(f => f.name === key).forEach(v => {
            if (v.values.indexOf(featureProperties[key]) === -1) {
              v.values.push(featureProperties[key]);
            }
          });
        }
      }
      return true;
    });
    return sourceFields;
  }
}
