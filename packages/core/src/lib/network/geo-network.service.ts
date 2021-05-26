import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators'
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
    console.log("Online get: ", url);
    const request = this.http.get(url, { responseType: 'blob' });
    request
      .pipe(first())
      .subscribe((blob) => {
        this.geoDataDB.update(url, blob);
      });
    return request;
  }

  private getOffline(url: string): Observable<Blob>  {
    console.log("Offline get: ", url);
    return this.geoDataDB.get(url);
  }
}
