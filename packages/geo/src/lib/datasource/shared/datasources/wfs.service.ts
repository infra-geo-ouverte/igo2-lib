import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import olFeature from 'ol/Feature';
import * as olformat from 'ol/format';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';
import { DataService } from './data.service';
import { formatWFSQueryString,
          gmlRegex,
          defaultEpsg,
          defaultMaxFeatures,
          getFormatFromOptions} from './wms-wfs.utils';

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
    propertyName?: string
  ): Observable<any> {
    const queryStringValues = formatWFSQueryString(dataSourceOptions, nb, epsgCode, propertyName);
    const baseUrl = queryStringValues.find(f => f.name === 'getfeature').value;
    const outputFormat = dataSourceOptions.paramsWFS.outputFormat;
    if (gmlRegex.test(outputFormat) || !outputFormat) {
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

      olFormats = getFormatFromOptions(dataSourceOptions);

      this.wfsGetFeature(dataSourceOptions, 1).subscribe(oneFeature => {
        const features = olFormats.readFeatures(oneFeature);
        fieldList = features[0].getKeys();
        fieldListWoGeom = fieldList.filter(
          field =>
            field !== features[0].getGeometryName() &&
            !field.match(/boundedby/gi)
        );
        fieldListWoGeomStr = fieldListWoGeom.join(',');
        this.wfsGetFeature(
          dataSourceOptions,
          dataSourceOptions.paramsWFS.maxFeatures || defaultMaxFeatures,
          dataSourceOptions.paramsWFS.srsName,
          fieldListWoGeomStr
        ).subscribe(manyFeatures => {
          const mfeatures = olFormats.readFeatures(manyFeatures);
          this.built_properties_value(mfeatures).forEach(element => {
            sourceFields.push(element);
          });
          d.next(sourceFields);
          d.complete();
        });
      });

    });
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
