import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WMSDataSourceOptions } from './datasources';

@Injectable({
  providedIn: 'root'
})
export class OptionsService {
  private urlApi = '/apis/igo2/layers/options';

  constructor(private http: HttpClient) {}

  getWMSOptions(baseOptions: WMSDataSourceOptions): Observable<any> {
    const params = new HttpParams({
      fromObject: {
        type: baseOptions.type,
        url: baseOptions.url,
        layers: baseOptions.params.LAYERS
      }
    });

    const request = this.http.get(this.urlApi, {
      params
    });

    return request.pipe(
      map(
        (res: {
          sourceOptions: WMSDataSourceOptions;
          layerOptions: Object;
        }) => {
          res.sourceOptions._layerOptionsFromSource = res.layerOptions;
          return res.sourceOptions;
        }
      )
    );
  }
}
