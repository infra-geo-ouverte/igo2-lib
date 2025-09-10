import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConnectionState, NetworkService } from '@igo2/core/network';
import { GeoDBService } from '@igo2/geo';

import { Type } from 'ol/format/Feature';

import { Observable } from 'rxjs';

export enum ResponseType {
  Arraybuffer = 'arraybuffer',
  Blob = 'blob',
  Text = 'text',
  Json = 'json'
}
export interface SimpleGetOptions {
  responseType: Type;
  withCredentials?: boolean;
}
@Injectable()
export class GeoNetworkService {
  private networkOnline = true;
  constructor(
    private http: HttpClient,
    private networkService: NetworkService,
    private geoDBService: GeoDBService
  ) {
    this.networkService.currentState().subscribe((state: ConnectionState) => {
      this.networkOnline = state.connection;
    });
  }

  get(url: string, simpleGetOptions: SimpleGetOptions): Observable<any> {
    if (window.navigator.onLine && this.networkOnline) {
      return this.getOnline(url, simpleGetOptions);
    }
    return this.getOffline(url);
  }

  private getOnline(
    url: string,
    simpleGetOptions: SimpleGetOptions
  ): Observable<any> {
    let request;
    switch (simpleGetOptions.responseType) {
      case 'arraybuffer':
        request = this.http.get(url, {
          responseType: 'arraybuffer',
          withCredentials: simpleGetOptions.withCredentials
        });
        break;
      case 'text':
        request = this.http.get(url, {
          responseType: 'text',
          withCredentials: simpleGetOptions.withCredentials
        });
        break;
      case 'json':
        request = this.http.get(url, {
          responseType: 'json',
          withCredentials: simpleGetOptions.withCredentials
        });
        break;
      default:
        request = this.http.get(url, {
          responseType: 'blob',
          withCredentials: simpleGetOptions.withCredentials
        });
        break;
    }
    return request;
  }

  private getOffline(url: string): Observable<object | Blob> {
    return this.geoDBService.get(url);
  }

  public isOnline() {
    return this.networkOnline && window.navigator.onLine;
  }
}
