import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConnectionState, NetworkService } from '@igo2/core';
import { Observable } from 'rxjs';
import { GeoDBService } from '../geoDB/geoDB.service';

@Injectable({
  providedIn: 'root'
})
export class GeoNetworkService {
  private networkOnline: boolean = true;
  constructor(
    private http: HttpClient,
    private geoDBService: GeoDBService,
    private networkService: NetworkService,
  ) {
    this.networkService.currentState().subscribe((state: ConnectionState) => {
      this.networkOnline = state.connection;
    });
  }

  get(url: string): Observable<Blob> {
    if (window.navigator.onLine && this.networkOnline) {
      return this.getOnline(url);
    }
    return this.getOffline(url);
  }

  private getOnline(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

  private getOffline(url: string): Observable<Blob> {
    return this.geoDBService.get(url);
  }

  public isOnline() {
    return this.networkOnline && window.navigator.onLine;
  }
}
