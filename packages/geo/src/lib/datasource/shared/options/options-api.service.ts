import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  AnyDataSourceOptions,
  ArcGISRestDataSourceOptions,
  ArcGISRestImageDataSourceOptions,
  TileArcGISRestDataSourceOptions,
  WMSDataSourceOptions
} from '../datasources';
import { OptionsApiOptions } from './options-api.interface';
import { OptionsService } from './options.service';

@Injectable({
  providedIn: 'root'
})
export class OptionsApiService extends OptionsService {
  private urlApi: string;
  private provideContextUri: boolean;

  constructor(
    private http: HttpClient,
    @Inject('options') options: OptionsApiOptions = {}
  ) {
    super();
    this.urlApi = options.url || this.urlApi;
    this.provideContextUri =
      options.provideContextUri || this.provideContextUri;
  }

  getWMSOptions(
    baseOptions: WMSDataSourceOptions,
    detailedContextUri?: string
  ): Observable<WMSDataSourceOptions> {
    if (!this.urlApi) {
      return of({} as WMSDataSourceOptions);
    }
    let params = new HttpParams({
      fromObject: {
        type: baseOptions.type,
        url: baseOptions.url,
        layers: baseOptions.params.LAYERS
      }
    });

    if (detailedContextUri && this.provideContextUri) {
      params = params.append('context', detailedContextUri);
    }

    const request = this.http.get(this.urlApi, {
      params
    });

    return request.pipe(
      map(
        (res: {
          sourceOptions: WMSDataSourceOptions;
          layerOptions: { [keys: string]: string };
        }) => this.handleSourceOptions(res)
      )
    );
  }

  getArcgisRestOptions(
    baseOptions:
      | ArcGISRestDataSourceOptions
      | ArcGISRestImageDataSourceOptions
      | TileArcGISRestDataSourceOptions,
    detailedContextUri?: string
  ): Observable<
    | ArcGISRestDataSourceOptions
    | ArcGISRestImageDataSourceOptions
    | TileArcGISRestDataSourceOptions
  > {
    if (!this.urlApi) {
      return of({} as ArcGISRestImageDataSourceOptions);
    }
    let params = new HttpParams({
      fromObject: {
        type: baseOptions.type,
        url: baseOptions.url,
        layers: baseOptions.layer
      }
    });

    if (detailedContextUri && this.provideContextUri) {
      params = params.append('context', detailedContextUri);
    }

    const request = this.http.get(this.urlApi, {
      params
    });

    return request.pipe(
      map(
        (res: {
          sourceOptions:
            | ArcGISRestDataSourceOptions
            | ArcGISRestImageDataSourceOptions
            | TileArcGISRestDataSourceOptions;
          layerOptions: { [keys: string]: string };
        }) => this.handleSourceOptions(res)
      )
    );
  }

  private handleSourceOptions<T extends AnyDataSourceOptions>(res: {
    sourceOptions: T;
    layerOptions: { [keys: string]: string };
  }) {
    if (!res || !res.sourceOptions) {
      return {} as WMSDataSourceOptions;
    }
    if (res.layerOptions) {
      res.sourceOptions._layerOptionsFromSource = res.layerOptions;
    } else {
      const { sourceOptions: _1, layerOptions: _2, ...restOptions } = res;
      res.sourceOptions._layerOptionsFromSource = restOptions;
    }
    return res.sourceOptions;
  }
}
