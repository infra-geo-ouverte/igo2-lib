import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt';

import { RequestService, ConfigService } from '../../../core';
import { Poi } from './poi.interface';

@Injectable()
export class PoiService {

  private baseUrl: string;

  constructor(private authHttp: AuthHttp,
              private requestService: RequestService,
              private config: ConfigService) {

    this.baseUrl = this.config.getConfig('context.url');
  }

  get(): Observable<Poi[]> {
    if (!this.baseUrl) { return Observable.empty(); }

    const url = this.baseUrl + '/pois';
    const request = this.authHttp.get(url);
    return this.requestService.register(request, 'Get POIs error')
      .map((res) => {
        const pois: Poi[] = res.json();
        return pois;
      });
  }

  delete(id: string): Observable<void> {
    const url = this.baseUrl + '/pois/' + id;
    const request = this.authHttp.delete(url);
    return this.requestService.register(request, 'Delete POI error')
      .map((res) => {
        return res;
      });
  }

  create(context: Poi): Observable<Poi> {
    const url = this.baseUrl + '/pois';
    const request = this.authHttp.post(url, JSON.stringify(context));
    return this.requestService.register(request, 'Create POI error')
      .map((res) => {
        return res.json();
      });
  }

}
