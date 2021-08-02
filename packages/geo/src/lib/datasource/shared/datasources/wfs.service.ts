import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, Observable, of } from 'rxjs';
import olFeature from 'ol/Feature';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';
import { DataService } from './data.service';
import { formatWFSQueryString,
          gmlRegex,
          defaultEpsg,
          defaultMaxFeatures,
          getFormatFromOptions} from './wms-wfs.utils';
import { concatMap } from 'rxjs/operators';
import { WFS } from 'ol/format';
import type { default as OlGeometry } from 'ol/geom/Geometry';
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

  public getSourceFieldsFromWFS(dataSourceOptions: WFSDataSourceOptions | WMSDataSourceOptions) {
    if (!dataSourceOptions.sourceFields || dataSourceOptions.sourceFields.length === 0 ) {
      dataSourceOptions.sourceFields = [];
      this.defineFieldAndValuefromWFS(dataSourceOptions).subscribe(getfeatureSourceField => {
        dataSourceOptions.sourceFields = getfeatureSourceField;
      });

    } else {
      this.defineFieldAndValuefromWFS(dataSourceOptions).subscribe(getfeatureSourceField => {
        dataSourceOptions.sourceFields.forEach(sourcefield => {
          if (sourcefield.alias === undefined) {
            sourcefield.alias = sourcefield.name; // to allow only a list of sourcefield with names
          }
          if (sourcefield.values === undefined || sourcefield.values.length === 0) {
            sourcefield.values = getfeatureSourceField.find(sf => sf.name === sourcefield.name).values;
          }
        });
      });
    }
  }

  private wfsGetFeature(
    dataSourceOptions: WFSDataSourceOptions | WMSDataSourceOptions,
    nb: number = defaultMaxFeatures,
    epsgCode: string = defaultEpsg,
    propertyName?: string,
    startIndex: number = 0,
    forceDefaultOutputFormat: boolean = false
  ): Observable<any> {
    const queryStringValues = formatWFSQueryString(dataSourceOptions, nb, epsgCode, propertyName, startIndex, forceDefaultOutputFormat );
    const baseUrl = queryStringValues.find(f => f.name === 'getfeature').value;
    const outputFormat = dataSourceOptions.paramsWFS.outputFormat;
    if (forceDefaultOutputFormat || gmlRegex.test(outputFormat) || !outputFormat) {
      return this.http.get(baseUrl, { responseType: 'text' });
    } else {
      return this.http.get(baseUrl);
    }
  }

  defineFieldAndValuefromWFS(
    dataSourceOptions: WFSDataSourceOptions | WMSDataSourceOptions
  ): Observable<any> {
    return new Observable(d => {
      const sourceFields = [];
      let fieldList;
      let fieldListWoGeom;
      let fieldListWoGeomStr;
      let olFormats;
      let effectiveOlFormats;

      olFormats = getFormatFromOptions(dataSourceOptions);
      const gmlDataSourceOptions: WFSDataSourceOptions | WMSDataSourceOptions = JSON.parse(
        JSON.stringify(dataSourceOptions)
      );
      delete gmlDataSourceOptions.paramsWFS.outputFormat;
      delete (gmlDataSourceOptions as WFSDataSourceOptions).formatOptions;

      effectiveOlFormats = getFormatFromOptions(gmlDataSourceOptions);
      let sourceFieldsToRetrieveValues = dataSourceOptions.sourceFields?.filter(f => !f.values).map(f => f.name);

      // Validate if the service manage no outputformat (wfs 1.0.0 and GML is the default return)
      this.wfsGetFeature(dataSourceOptions, 1, undefined, undefined, 0, true).pipe(
        concatMap(res => String(res).toLowerCase().includes('exception') ? of(false) : of(true)),
        concatMap(allowGml => {
          // If the service return GML (return no exception)
          return this.wfsGetFeature(dataSourceOptions, 1).pipe(
            concatMap(firstFeature => {
              const features = olFormats.readFeatures(firstFeature);
              fieldList = features[0].getKeys();
              if (dataSourceOptions.sourceFields || dataSourceOptions.sourceFields.length === 0) {
                sourceFieldsToRetrieveValues = fieldList;
              }
              fieldListWoGeom = fieldList.filter(
                field =>
                  sourceFieldsToRetrieveValues.includes(field) &&
                  field !== features[0].getGeometryName() &&
                  !field.match(/boundedby/gi)
              );
              fieldListWoGeomStr = fieldListWoGeom.join(',');
              const processingArray = [];
              let startIndex = 0;
              // If the service do not allow gml return, dice the call in multiple
              // calls by increment of chunkSize with the original outputFormat
              if (
                !allowGml && dataSourceOptions.paramsWFS.version === '2.0.0' &&
                dataSourceOptions.paramsWFS.maxFeatures > defaultMaxFeatures) {
                const chunkSize = 1000;
                while (startIndex < dataSourceOptions.paramsWFS.maxFeatures) {
                  processingArray.push(this.wfsGetFeature(
                    dataSourceOptions,
                    chunkSize,
                    dataSourceOptions.paramsWFS.srsName,
                    fieldListWoGeomStr,
                    startIndex
                  ));
                  startIndex += chunkSize;
                }
                effectiveOlFormats = olFormats;
              } else {
                processingArray.push(this.wfsGetFeature(
                  dataSourceOptions,
                  dataSourceOptions.paramsWFS.maxFeatures || defaultMaxFeatures,
                  dataSourceOptions.paramsWFS.srsName,
                  fieldListWoGeomStr,
                  0, true
                ));
              }
              return combineLatest(processingArray);
            })
          );
        })).subscribe((results) => {
          let mfeatures: olFeature<OlGeometry>[] = [];
          results.map((result) => {
            const loopFeatures = effectiveOlFormats.readFeatures(result);
            mfeatures = mfeatures.concat(loopFeatures);
          });
          this.built_properties_value(mfeatures).forEach(element => {
            sourceFields.push(element);
          });
          d.next(sourceFields);
          d.complete();
        });
    });
  }

  private built_properties_value(features: olFeature<OlGeometry>[]): string[] {
    if (features.length === 0) {
      return [];
    }
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
