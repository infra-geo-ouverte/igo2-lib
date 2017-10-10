import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { RequestService, ConfigService } from '../../core';
import { AuthHttp } from '../../auth';

import { Catalog } from './catalog.interface';

@Injectable()
export class CatalogService {

  public catalog$ = new BehaviorSubject<Catalog>(undefined);
  public catalogs$ = new BehaviorSubject<Catalog[]>(undefined);
  private baseUrl: string;

  constructor(private authHttp: AuthHttp,
              private requestService: RequestService,
              private config: ConfigService) {

    const options = this.config.getConfig('context') || {};

    this.baseUrl = options.url;
  }

  get(): Observable<Catalog[]> {
    const url = this.baseUrl + '/catalogs';
    const request = this.authHttp.get(url);
    return this.requestService.register(request, 'Get catalogs error')
      .map((res) => {
        const catalogs: Catalog[] = res.json();
        return catalogs;
      });
  }

  getById(id: string): Observable<Catalog> {
    const url = this.baseUrl + '/catalogs/' + id;
    const request = this.authHttp.get(url);
    return this.requestService.register(request, 'Get catalog error')
      .map((res) => {
        const catalog: Catalog = res.json();
        return catalog;
      });
  }

  selectCatalog(catalog: Catalog) {
    if (this.catalog$.value !== catalog) {
      this.catalog$.next(catalog);
    }
  }

  load() {
    const catalogConfig = this.config.getConfig('catalog') || {};
    if (!this.baseUrl) {
      if (catalogConfig.sources) {
        this.catalogs$.next(catalogConfig.sources);
      }
      return;
    }

    this.get().subscribe((catalogs) => {
      if (catalogConfig.sources) {
        catalogs = catalogs.concat(catalogConfig.sources);
      }
      if (catalogs) {
        this.catalogs$.next(catalogs);
      }
    });
  }

}
