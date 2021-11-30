import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';
import { TileDBService } from '../storage';

@Injectable({
  providedIn: 'root'
})
export class GeoNetworkService {
  readonly pingURL = window.location.origin;
  private networkOnline: boolean = true;
  private pingServer$: Subscription;
  constructor(
    private http: HttpClient,
    private geoDataDB: TileDBService
  ) {
    this.pingServer$ = interval(2000).subscribe(() => {
      this.pingServer();
    });
  }

  get(url: string): Observable<Blob> {
    if (window.navigator.onLine && this.networkOnline) {
      return this.getOnline(url);
    }
    return this.getOffline(url);
  }

  private getOnline(url: string): Observable<Blob> {
    const request = this.http.get(url, { responseType: 'blob' });
    return request;
  }

  private getOffline(url: string): Observable<Blob> {
    return this.geoDataDB.get(url);
  }

  private pingServer() {
    if (!window.navigator.onLine) {
      return;
    }
    // need to find a way to prevent loging the 504 gateway in console
    this.http.get(this.pingURL, {
      responseType: 'text',
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache'
      })
    })
    .subscribe(() => {
      this.networkOnline = true;
    },
    () => {
      this.networkOnline = false;
    });
  }

  public isOnline() {
    return this.networkOnline && window.navigator.onLine;
  }
}
