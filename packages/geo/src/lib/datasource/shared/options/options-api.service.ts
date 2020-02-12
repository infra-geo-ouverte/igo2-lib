import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from '@igo2/core';

import { WMSDataSourceOptions } from '../datasources';
import { OptionsService } from './options.service';

@Injectable({
  providedIn: 'root'
})
export class OptionsApiService extends OptionsService {
  private urlApi = '/apis/igo2/layers/options';

  constructor(private http: HttpClient, private configService: ConfigService) {
    super();
    this.urlApi = this.configService.getConfig('optionsApi.url') || this.urlApi;
  }

  getWMSOptions(
    baseOptions: WMSDataSourceOptions
  ): Observable<WMSDataSourceOptions> {
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
          layerOptions: { [keys: string]: string };
        }) => {
          if (!res.sourceOptions) {
            return {} as WMSDataSourceOptions;
          }
          res.sourceOptions._layerOptionsFromSource = res.layerOptions;
          return res.sourceOptions;
        }
      )
    );
  }
}
