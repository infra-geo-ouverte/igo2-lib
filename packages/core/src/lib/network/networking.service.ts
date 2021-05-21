import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContextDBManagerService } from '../storage';
import { ContextDBService } from '../storage/context-db.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkingService {

  constructor(
    private http: HttpClient,
    private contextDb: ContextDBService,
    private contextDBManager: ContextDBManagerService
  ) { }
  
  public getContext(url: string, options?): Observable<Object> {
    if(window.navigator.onLine === true) {
      this.contextDBManager.update(url);
      return this.getContextOnline(url, options);
    }
    return this.getContextOffline(url);
  }

  private getContextOnline(url: string, options?): Observable<Object> {
    console.log("Online get of context: ", url);
    return this.http.get(url, options);
  }

  private getContextOffline(url: string) {
    console.log("Offline get of context: ", url);
    return this.contextDb.get(url);
  }
}
