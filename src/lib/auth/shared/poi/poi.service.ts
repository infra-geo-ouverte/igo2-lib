import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/observable/empty';

import { ConfigService } from '../../../core';
import { Poi } from './poi.interface';

@Injectable()
export class PoiService {

  private baseUrl: string;

  constructor(private http: HttpClient,
              private config: ConfigService) {

    this.baseUrl = this.config.getConfig('context.url');
  }

  get(): Observable<Poi[]> {
    if (!this.baseUrl) { return empty(); }

    const url = this.baseUrl + '/pois';
    return this.http.get<Poi[]>(url);
  }

  delete(id: string): Observable<void> {
    const url = this.baseUrl + '/pois/' + id;
    return this.http.delete<void>(url);
  }

  create(context: Poi): Observable<Poi> {
    const url = this.baseUrl + '/pois';
    return this.http.post<Poi>(url, JSON.stringify(context));
  }

}
