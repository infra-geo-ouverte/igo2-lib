import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConnectionState, NetworkService } from '@igo2/core';
import { Observable } from 'rxjs';
import { GeoDBService } from '../geoDB/geoDB.service';

export enum ResponseType {
  Arraybuffer = 'arraybuffer',
  Blob = 'blob',
  Text = 'text',
  Json = 'json'
}
export interface SimpleGetOptions {
  responseType: ResponseType;
  withCredentials?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class GeoNetworkService {
  private networkOnline: boolean = true;
  constructor(
    private http: HttpClient,
    public geoDBService: GeoDBService,
    private networkService: NetworkService
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
      // TODO Ajuster pour autre formats
      case 'arraybuffer':
        request = this.http.get(url, {
          responseType: 'arraybuffer',
          withCredentials: simpleGetOptions.withCredentials
        });
        break;
      case 'blob':
        request = this.http.get(url, {
          responseType: 'blob',
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

  private getOffline(url: string): Observable<any> {
    return this.geoDBService.get(url);
  }

  public isOnline() {
    return this.networkOnline && window.navigator.onLine;
  }
}
