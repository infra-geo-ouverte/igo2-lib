import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { LanguageService, ConfigService } from '../../core';

import { Catalog } from './catalog.interface';

@Injectable()
export class CatalogService {

  public catalog$ = new BehaviorSubject<Catalog>(undefined);
  public catalogs$ = new BehaviorSubject<Catalog[]>(undefined);
  private baseUrl: string;

  constructor(private http: HttpClient,
              private config: ConfigService,
              private languageService: LanguageService) {

    const options = this.config.getConfig('context') || {};

    this.baseUrl = options.url;
  }

  get(): Observable<Catalog[]> {
    const url = this.baseUrl + '/catalogs';
    return this.http.get<Catalog[]>(url);
  }

  getById(id: string): Observable<Catalog> {
    const url = this.baseUrl + '/catalogs/' + id;
    return this.http.get<Catalog>(url);
  }

  getBaseLayers(url: string): Observable<any> {
    return this.http.get(url);
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
      if (catalogConfig.baseLayers) {
        const translate = this.languageService.translate;
        const title = translate.instant('igo.catalogTool.baseLayers');
        catalogs.unshift({
          title: title,
          url: this.baseUrl + '/baselayers',
          type: 'layers'
        });
      }
      if (catalogConfig.sources) {
        catalogs = catalogs.concat(catalogConfig.sources);
      }
      if (catalogs) {
        this.catalogs$.next(catalogs);
      }
    });
  }

}
