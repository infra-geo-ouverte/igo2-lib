import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

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
  private http = inject(HttpClient);

  private urlApi?: string;
  private provideContextUri = false;

  constructor() {
    const config = inject(ConfigService);
    const options = config.getConfig<OptionsApiOptions>('optionsApi');

    super();
    this.urlApi = options?.url;
    this.provideContextUri = options?.provideContextUri ?? false;
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
        type: baseOptions.type ?? '',
        url: baseOptions.url ?? '',
        layers: baseOptions.params.LAYERS
      }
    });

    if (detailedContextUri && this.provideContextUri) {
      params = params.append('context', detailedContextUri);
    }

    const request = this.http.get<{
      sourceOptions: WMSDataSourceOptions;
      layerOptions: { [keys: string]: string };
    }>(this.urlApi!, {
      params
    });

    return request.pipe(map((res) => this.handleSourceOptions(res)));
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
        type: baseOptions.type ?? '',
        url: baseOptions.url ?? '',
        layers: baseOptions.layer ?? ''
      }
    });

    if (detailedContextUri && this.provideContextUri) {
      params = params.append('context', detailedContextUri);
    }

    const request = this.http.get<{
      sourceOptions:
        | ArcGISRestDataSourceOptions
        | ArcGISRestImageDataSourceOptions
        | TileArcGISRestDataSourceOptions;
      layerOptions: { [keys: string]: string };
    }>(this.urlApi!, {
      params
    });

    return request.pipe(map((res) => this.handleSourceOptions(res)));
  }

  private handleSourceOptions<T extends AnyDataSourceOptions>(res: {
    sourceOptions: T;
    layerOptions: { [keys: string]: string };
  }): T {
    if (!res || !res.sourceOptions) {
      return {} as T;
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
