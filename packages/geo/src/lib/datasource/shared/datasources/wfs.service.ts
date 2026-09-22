import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import olFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { Observable, combineLatest, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { DataService } from './data.service';
import { SourceFieldsOptionsParams } from './datasource.interface';
import {
  WFSDataSourceOptions,
  WFSDataSourceOptionsParams
} from './wfs-datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';
import {
  defaultEpsg,
  defaultMaxFeatures,
  formatWFSQueryString,
  getFormatFromOptions,
  gmlRegex
} from './wms-wfs.utils';

@Injectable({
  providedIn: 'root'
})
export class WFSService extends DataService {
  private http = inject(HttpClient);

  getData() {
    console.log('This is defining a data service.');
    return 'This is defining a data service.';
  }

  public getSourceFieldsFromWFS(
    dataSourceOptions: WFSDataSourceOptions | WMSDataSourceOptions
  ) {
    if (
      !dataSourceOptions.sourceFields ||
      dataSourceOptions.sourceFields.length === 0
    ) {
      dataSourceOptions.sourceFields = [];
      this.defineFieldAndValuefromWFS(dataSourceOptions).subscribe(
        (getfeatureSourceField) => {
          dataSourceOptions.sourceFields =
            getfeatureSourceField as SourceFieldsOptionsParams[];
        }
      );
    } else {
      this.defineFieldAndValuefromWFS(dataSourceOptions).subscribe(
        (getfeatureSourceField) => {
          dataSourceOptions.sourceFields?.forEach((sourcefield) => {
            if (sourcefield.alias === undefined) {
              sourcefield.alias = sourcefield.name;
            }
            if (
              sourcefield.values === undefined ||
              sourcefield.values?.length === 0
            ) {
              sourcefield.values = getfeatureSourceField.find(
                (sf) => sf.name === sourcefield.name
              )?.values;
            }
          });
        }
      );
    }
  }

  private wfsGetFeature(
    dataSourceOptions: WFSDataSourceOptions | WMSDataSourceOptions,
    nb: number = defaultMaxFeatures,
    epsgCode: string = defaultEpsg,
    propertyName?: string,
    startIndex = 0,
    forceDefaultOutputFormat = false
  ): Observable<any> {
    const queryStringValues = formatWFSQueryString(
      dataSourceOptions,
      nb,
      epsgCode,
      propertyName,
      startIndex,
      forceDefaultOutputFormat
    );
    const baseUrl = queryStringValues.find(
      (f) => f.name === 'getfeature'
    )!.value;
    const outputFormat = dataSourceOptions.paramsWFS?.outputFormat;
    if (
      forceDefaultOutputFormat ||
      !outputFormat ||
      gmlRegex.test(outputFormat)
    ) {
      return this.http.get(baseUrl, { responseType: 'text' });
    } else {
      return this.http.get(baseUrl);
    }
  }

  defineFieldAndValuefromWFS(
    dataSourceOptions: WFSDataSourceOptions | WMSDataSourceOptions
  ): Observable<SourceFieldsOptionsParams[]> {
    return new Observable((d) => {
      const sourceFields: SourceFieldsOptionsParams[] = [];
      let fieldList: string[];
      let fieldListWoGeom: string[];
      let fieldListWoGeomStr: string;
      let effectiveOlFormats = getFormatFromOptions(dataSourceOptions);

      const olFormats = getFormatFromOptions(dataSourceOptions);
      const gmlDataSourceOptions: WFSDataSourceOptions | WMSDataSourceOptions =
        JSON.parse(JSON.stringify(dataSourceOptions));
      if (gmlDataSourceOptions.paramsWFS) {
        delete (
          gmlDataSourceOptions.paramsWFS as Partial<WFSDataSourceOptionsParams>
        ).outputFormat;
      }
      delete (gmlDataSourceOptions as WFSDataSourceOptions).formatOptions;

      effectiveOlFormats = getFormatFromOptions(gmlDataSourceOptions);
      let sourceFieldsToRetrieveValues = dataSourceOptions.sourceFields
        ?.filter((f) => !f.values)
        .map((f) => f.name);

      const getFeatureResults = dataSourceOptions.sourceFields?.some(
        (f) => f.values?.length
      )
        ? of([])
        : this.wfsGetFeature(
            dataSourceOptions,
            1,
            undefined,
            undefined,
            0,
            true
          ).pipe(
            concatMap((res) =>
              String(res).toLowerCase().includes('exception')
                ? of(false)
                : of(true)
            ),
            concatMap((allowGml) => {
              return this.wfsGetFeature(dataSourceOptions, 1).pipe(
                concatMap((firstFeature) => {
                  const features = olFormats.readFeatures(
                    firstFeature
                  ) as olFeature<OlGeometry>[];
                  fieldList = features[0].getKeys();
                  if (dataSourceOptions.sourceFields?.length === 0) {
                    sourceFieldsToRetrieveValues = fieldList;
                  }
                  fieldListWoGeom = fieldList.filter(
                    (field) =>
                      sourceFieldsToRetrieveValues!.includes(field) &&
                      field !== features[0].getGeometryName() &&
                      !field.match(/boundedby/gi)
                  );
                  fieldListWoGeomStr = fieldListWoGeom.join(',');
                  const processingArray = [];
                  let startIndex = 0;
                  const paramsWFS = dataSourceOptions.paramsWFS;
                  if (
                    !allowGml &&
                    paramsWFS &&
                    paramsWFS.version === '2.0.0' &&
                    paramsWFS.maxFeatures !== undefined &&
                    paramsWFS.maxFeatures > defaultMaxFeatures
                  ) {
                    const chunkSize = 1000;
                    while (startIndex < paramsWFS.maxFeatures!) {
                      processingArray.push(
                        this.wfsGetFeature(
                          dataSourceOptions,
                          chunkSize,
                          paramsWFS.srsName,
                          fieldListWoGeomStr,
                          startIndex
                        )
                      );
                      startIndex += chunkSize;
                    }
                    effectiveOlFormats = olFormats;
                  } else {
                    processingArray.push(
                      this.wfsGetFeature(
                        dataSourceOptions,
                        paramsWFS?.maxFeatures || defaultMaxFeatures,
                        paramsWFS?.srsName,
                        fieldListWoGeomStr,
                        0,
                        true
                      )
                    );
                  }
                  return combineLatest(processingArray);
                })
              );
            })
          );

      getFeatureResults.subscribe((results) => {
        let mfeatures: olFeature<OlGeometry>[] = [];
        results.map((result) => {
          const loopFeatures = effectiveOlFormats.readFeatures(
            result
          ) as olFeature<OlGeometry>[];
          mfeatures = mfeatures.concat(loopFeatures);
        });
        this.built_properties_value(mfeatures).forEach((element) => {
          sourceFields.push(element);
        });
        d.next(sourceFields);
        d.complete();
      });
    });
  }

  private built_properties_value(
    features: olFeature<OlGeometry>[]
  ): SourceFieldsOptionsParams[] {
    if (features.length === 0) {
      return [];
    }
    const kv = Object.assign({}, features[0].getProperties());
    delete kv[features[0].getGeometryName()];
    delete kv.boundedBy;
    const sourceFields: SourceFieldsOptionsParams[] = [];
    for (const property in kv) {
      // eslint-disable-next-line no-prototype-builtins
      if (kv.hasOwnProperty(property)) {
        const fieldType =
          typeof features[0].get(property) === 'object'
            ? undefined
            : (typeof features[0].get(
                property
              ) as SourceFieldsOptionsParams['type']);
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
        // eslint-disable-next-line no-prototype-builtins
        if (featureProperties.hasOwnProperty(key) && key in kv) {
          sourceFields
            .filter((f) => f.name === key)
            .forEach((v) => {
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
