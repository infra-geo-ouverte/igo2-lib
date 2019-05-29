import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import olFeature from 'ol/Feature';
import * as olformat from 'ol/format';

import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { DataService } from './data.service';
import { formatWFSQueryString, gmlRegex, defaultEpsg, defaultMaxFeatures} from './wms-wfs.utils';

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
            0
          ).subscribe(rep => (f.values = rep));
        });
    }
  }

  private wfsGetFeature(
    wfsDataSourceOptions: WFSDataSourceOptions,
    nb = defaultMaxFeatures,
    epsgCode = defaultEpsg,
    propertyname?
  ): Observable<any> {
    const queryStringValues = formatWFSQueryString(wfsDataSourceOptions, nb, epsgCode, propertyname);
    const baseUrl = queryStringValues.find(f => f.name === 'getfeature').value;
    const outputFormat = wfsDataSourceOptions.paramsWFS.outputFormat;
    if (gmlRegex.test(outputFormat) || !outputFormat) {
      return this.http.get(baseUrl, { responseType: 'text' });
    } else {
      return this.http.get(baseUrl);
    }
  }

  public getValueFromWfsGetPropertyValues(
    wfsDataSourceOptions: WFSDataSourceOptions,
    field,
    retry = 0
  ): Observable<any> {
    return new Observable(d => {
      const nbRetry = 2;
      const valueList = [];

      this.wfsGetPropertyValue(
        wfsDataSourceOptions,
        field
      ).subscribe(
        str => {
          str = str.replace(/&#39;/gi, "'");
          const regexExcp = /exception/gi;
          if (regexExcp.test(str)) {
            retry++;
            if (retry < nbRetry) {
              this.getValueFromWfsGetPropertyValues(
                wfsDataSourceOptions,
                field,
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
              retry
            ).subscribe(rep => d.next(rep));
          }
        }
      );
    });
  }

  wfsGetCapabilities(options): Observable<any> {
    const queryStringValues = formatWFSQueryString(options);
    const wfsGcUrl = queryStringValues.find(f => f.name === 'getcapabilities').value;
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
      const outputFormat = wfsDataSourceOptions.paramsWFS.outputFormat;

      if (gmlRegex.test(outputFormat) || !outputFormat) {
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
              wfsDataSourceOptions.paramsWFS.maxFeatures || defaultMaxFeatures
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
            wfsDataSourceOptions.paramsWFS.maxFeatures || defaultMaxFeatures,
            undefined,
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
    field
  ): Observable<any> {
    const queryStringValues = formatWFSQueryString(wfsDataSourceOptions, undefined, undefined, field);
    const baseUrl = queryStringValues.find(f => f.name === 'getpropertyvalue').value;
    return this.http.get(baseUrl, { responseType: 'text' });
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
