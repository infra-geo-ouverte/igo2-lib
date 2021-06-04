import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable, Observer, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GeoDataDBService } from '../storage';

@Injectable({
  providedIn: 'root'
})
export class GeoNetworkService {
  readonly pingURL = window.location.origin;
  private networkOnline: boolean = true;
  private pingServer$: Subscription;
  constructor(
    private http: HttpClient,
    private geoDataDB: GeoDataDBService
  ) { 
    this.pingServer$ = interval(2000).subscribe(() => {
      this.pingServer();
    })
  }
  
  get(url: string): Observable<Blob> {
    if (window.navigator.onLine && this.networkOnline) {
      return this.getOnline(url);
    }
    return this.getOffline(url);
  }

  private getOnline(url: string): Observable<Blob> {
    console.log("Online get")
    const request = this.http.get(url, { responseType: 'blob' });
    return request;
  }

  private getOffline(url: string): Observable<Blob>  {
    console.log("Offline get")
    return this.geoDataDB.get(url);
  }

  private pingServer() {
    //console.log("ping server");
    if (!window.navigator.onLine) {
      return;
    }
    // need to find a way to prevent loging the 504 gateway in console
    this.http.get(this.pingURL, { 
      responseType: 'text',
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
      })
    })
    .subscribe(() => {
      console.log("ping good");
      this.networkOnline = true;
    },
    () => {
      console.log("ping error");
      this.networkOnline = false;
    });
  }

  public isOnline() {
    return this.networkOnline && window.navigator.onLine;
  }
}
