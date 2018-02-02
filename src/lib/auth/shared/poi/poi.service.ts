import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { RequestService, ConfigService } from '../../../core';
import { Poi } from './poi.interface';

@Injectable()
export class PoiService {

  private baseUrl: string;

  constructor(private http: HttpClient,
              private requestService: RequestService,
              private config: ConfigService) {

    this.baseUrl = this.config.getConfig('context.url');
  }

  get(): Observable<Poi[]> {
    if (!this.baseUrl) { return Observable.empty(); }

    const url = this.baseUrl + '/pois';
    const request = this.http.get<Poi[]>(url);
    return this.requestService.register(request, 'Get POIs error');
  }

  delete(id: string): Observable<void> {
    const url = this.baseUrl + '/pois/' + id;
    const request = this.http.delete(url);
    return this.requestService.register(request, 'Delete POI error');
  }

  create(context: Poi): Observable<Poi> {
    const url = this.baseUrl + '/pois';
    const request = this.http.post<Poi>(url, JSON.stringify(context));
    return this.requestService.register(request, 'Create POI error');
  }

}
