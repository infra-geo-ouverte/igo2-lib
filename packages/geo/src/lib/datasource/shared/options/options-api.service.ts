import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { WMSDataSourceOptions } from '../datasources';
import { OptionsService } from './options.service';
import { OptionsApiOptions } from './options-api.interface';

@Injectable({
  providedIn: 'root'
})
export class OptionsApiService extends OptionsService {
  private urlApi: string;

  constructor(
    private http: HttpClient,
    @Inject('options') options: OptionsApiOptions = {}
  ) {
    super();
    this.urlApi = options.url || this.urlApi;
  }

  getWMSOptions(
    baseOptions: WMSDataSourceOptions
  ): Observable<WMSDataSourceOptions> {
    if (!this.urlApi) {
      return of({} as WMSDataSourceOptions);
    }
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
          if (!res || !res.sourceOptions) {
            return {} as WMSDataSourceOptions;
          }
          res.sourceOptions._layerOptionsFromSource = res.layerOptions;
          return res.sourceOptions;
        }
      )
    );
  }
}
