import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeoDataDBService } from '../storage';

@Injectable({
  providedIn: 'root'
})
export class GeoNetworkService {

  constructor(
    private http: HttpClient,
    private geoDataDB: GeoDataDBService
  ) { }

  get(url: string): Observable<Blob> {
    if (window.navigator.onLine) {
      return this.getOnline(url);
    }
    return this.getOffline(url);
  }

  private getOnline(url: string): Observable<Blob> {
    const request = this.http.get(url, { responseType: 'blob' });
    return request;
  }

  private getOffline(url: string): Observable<Blob>  {
    return this.geoDataDB.get(url);
  }
}
