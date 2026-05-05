import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Feature } from '../../feature/shared/feature.interfaces';
import {
  SpatialFilterItemType,
  SpatialFilterQueryType,
  SpatialFilterType
} from './spatial-filter.enum';
import { SpatialFilterThematic } from './spatial-filter.interface';

@Injectable({
  providedIn: 'root'
})
export class SpatialFilterService {
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);
  private configService = inject(ConfigService);

  public baseUrl = 'https://geoegl.msp.gouv.qc.ca/apis/terrapi';

  /*
   * Type association with URL
   */
  public urlFilterList = {
    AdmRegion: 'regadmin',
    Arrond: 'arrondissements',
    CircFed: 'circ-fed',
    CircProv: 'circ-prov',
    DirReg: 'dir-reg',
    MRC: 'mrc',
    Mun: 'municipalites',
    RegTour: 'tourisme',
    RSS: 'rss',
    RLS: 'rls',
    CLSC: 'clsc',
    tours: 'tours',
    bornes: 'bornes-sumi',
    hydro: 'hydro',
    routes: 'routes',
    matricule: 'matricules-fonciers',
    aggloMun: 'agglomeration',
    adresses: 'adresses',
    unites: 'unites'
  };

  constructor() {
    this.baseUrl =
      this.configService.getConfig('spatialFilter.url') || this.baseUrl;
  }

  getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  /*
   * Loading data for spatial filter list component (NO GEOMETRY)
   */
  loadFilterList(type: SpatialFilterQueryType): Observable<Feature[]> {
    const urlPath = type as string;
    if (urlPath) {
      return this.http
        .get<{
          features: Feature[];
        }>(`${this.baseUrl}/${this.urlFilterList[urlPath]}`)
        .pipe(
          map((featureCollection) =>
            featureCollection.features.map((f) => {
              f.meta = {
                id: f.properties.code
              };
              return f;
            })
          )
        );
    }
  }

  /*
   * Loading item list (STRING)
   */
  loadThematicsList() {
    const url = 'types';
    const items: SpatialFilterThematic[] = [];
    return this.http.get(`${this.baseUrl}/${url}`).pipe(
      map((types: string[]) => {
        types.forEach((type) => {
          if (type.startsWith('lieux')) {
            const item: SpatialFilterThematic = {
              name: undefined,
              source: type
            };
            let substr = type.substring(6, type.length);
            let name = substr;
            if (substr.includes('.')) {
              const index = substr.indexOf('.');
              name = substr.substring(index + 1, substr.length);
              substr = substr.substring(0, index);
            }
            try {
              item.name = this.languageService.translate.instant(
                'igo.geo.terrapi.' + name
              );
            } catch {
              item.name =
                name.substring(0, 1).toUpperCase() +
                name.substring(1, name.length - 1);
            }

            try {
              item.group = this.languageService.translate.instant(
                'igo.geo.spatialFilter.group.' + substr
              );
            } catch {
              item.group =
                substr.substring(0, 1).toUpperCase() +
                substr.substring(1, name.length - 1);
            }

            items.push(item);
          } else {
            if (this.getKeyByValue(this.urlFilterList, type)) {
              const item: SpatialFilterThematic = {
                name: undefined,
                source: type
              };
              const name = this.getKeyByValue(this.urlFilterList, type);
              try {
                item.name = this.languageService.translate.instant(
                  'igo.geo.terrapi.' + name
                );
              } catch {
                item.name =
                  name.substring(0, 1).toUpperCase() +
                  name.substring(1, name.length - 1);
              }
              item.source = type;

              if (name === this.urlFilterList.adresses) {
                item.group = this.languageService.translate.instant(
                  'igo.geo.spatialFilter.group.addresses'
                );
                item.name = this.languageService.translate.instant(
                  'igo.geo.terrapi.address'
                );
              }

              items.push(item);
            }
          }
        });
        return items;
      })
    );
  }

  /*
   * Loading data for spatial filter item component (Address or Thematics) depends on predefined zone or draw zone (feature)
   */
  loadFilterItems(
    features: Feature[],
    itemType: SpatialFilterItemType,
    options: {
      type: SpatialFilterQueryType;
      thematics: SpatialFilterThematic[];
      buffer?: number;
    }
  ) {
    if (options.type) {
      return this.loadPredefinedFilterItems(features, itemType, options);
    } else {
      return this.loadDrawFilterItems(features[0], itemType, options);
    }
  }

  /*
   * Get one territory by id (WITH GEOMETRY)
   */
  loadItemById(
    feature: Feature,
    type: SpatialFilterQueryType
  ): Observable<Feature> {
    const featureType = this.urlFilterList[type];
    const featureCode = feature.properties.code;
    if (featureType && featureCode) {
      return this.http
        .get<Feature>(`${this.baseUrl}/${featureType}/${featureCode}`, {
          params: {
            geometry: 'true'
          }
        })
        .pipe(
          map((f) => {
            f.meta = {
              id: f.properties.code,
              alias: f.properties.nom,
              title: f.properties.nom
            };
            return f;
          })
        );
    }
  }

  /*
   * Get buffer geometry
   */
  loadBufferGeometry(
    feature: Feature,
    filterType: SpatialFilterType,
    buffer?: number,
    type?: SpatialFilterQueryType
  ): Observable<Feature> {
    if (filterType === SpatialFilterType.Predefined) {
      const featureType = this.urlFilterList[type];
      const featureCode = feature.properties.code;
      if (featureType && featureCode) {
        return this.http
          .get<Feature>(`${this.baseUrl}/${featureType}/${featureCode}`, {
            params: {
              geometry: '100',
              bufferOutput: buffer.toString()
            }
          })
          .pipe(
            map((f) => {
              f.meta = {
                id: f.properties.code,
                alias: f.properties.nom,
                title: f.properties.nom
              };
              return f;
            })
          );
      }
    } else {
      return this.http
        .post<Feature>(`${this.baseUrl}/geospatial/buffer?`, {
          buffer,
          loc: JSON.stringify(feature)
        })
        .pipe(
          map((f) => {
            return f;
          })
        );
    }
  }

  private getHttpParams(buffer: number) {
    return {
      geometry: 'true',
      icon: 'true',
      bufferInput: buffer.toString(),
      simplified: '100'
    };
  }

  private doGet(url: string, buffer: number, mapFn: (f: Feature) => Feature) {
    return this.http
      .get<{ features: Feature[] }>(url, { params: this.getHttpParams(buffer) })
      .pipe(map((fc) => fc.features.map(mapFn)));
  }

  private doPost(url: string, body: any, mapFn: (f: Feature) => Feature) {
    return this.http
      .post<{ features: Feature[] }>(url, body)
      .pipe(map((fc) => fc.features.map(mapFn)));
  }

  private buildMetaForAddress(f: Feature): Feature {
    f.meta = {
      id: f.properties.code,
      title: this.languageService.translate.instant(
        'igo.geo.spatialFilter.Address'
      ),
      icon: (f as any).icon
    };
    return f;
  }

  private buildMetaForThematic(
    f: Feature,
    thematics: SpatialFilterThematic[]
  ): Feature {
    const { type, code } = f.properties;
    const thematic = thematics.find((th) => th.source === type);
    f.meta = {
      id: code,
      title: thematic?.name ?? type,
      icon: (f as any).icon
    };
    return f;
  }

  private loadPredefinedFilterItems(
    features: Feature[],
    itemType: SpatialFilterItemType,
    options: {
      type: SpatialFilterQueryType;
      thematics: SpatialFilterThematic[];
      buffer?: number;
    }
  ) {
    const { type, thematics, buffer = 0 } = options;
    const codes = features.map((f) => f.properties.code).join(',');
    const urlBase = `${this.baseUrl}/${this.urlFilterList[type as string]}`;
    if (itemType === SpatialFilterItemType.Address) {
      return this.doGet(`${urlBase}/${codes}/adresses`, buffer, (f) =>
        this.buildMetaForAddress(f)
      );
    } else {
      const sources = thematics.map((t) => t.source).join(',');
      return this.doGet(`${urlBase}/${codes}/${sources}`, buffer, (f) =>
        this.buildMetaForThematic(f, thematics)
      );
    }
  }

  private loadDrawFilterItems(
    feature: Feature,
    itemType: SpatialFilterItemType,
    options: {
      thematics?: SpatialFilterThematic[];
      buffer?: number;
    }
  ) {
    const { thematics = [], buffer = 0 } = options;
    const loc = JSON.stringify(feature);
    const urlBase = `${this.baseUrl}/locate`;
    if (itemType === SpatialFilterItemType.Address) {
      return this.doPost(
        `${urlBase}?type=adresses`,
        { ...this.getHttpParams(buffer), loc: loc },
        (f) => this.buildMetaForAddress(f)
      );
    } else {
      const sources = thematics.map((t) => t.source).join(',');
      return this.doPost(
        `${urlBase}?type=${sources}`,
        { ...this.getHttpParams(buffer), loc: loc },
        (f) => this.buildMetaForThematic(f, thematics)
      );
    }
  }

  loadBuffersGeometry(
    features: Feature[],
    options: {
      filterType: SpatialFilterType;
      buffer?: number;
      type?: SpatialFilterQueryType;
    }
  ): Observable<Feature[]> {
    const { filterType, buffer, type } = options;
    if (filterType === SpatialFilterType.Predefined) {
      const featureType = this.urlFilterList[type];
      const featureCode =
        'code=' + features.map((f) => f.properties.code).join(',');
      if (featureType && featureCode) {
        return this.http
          .get<{ type: string; features: Feature[] }>(
            `${this.baseUrl}/${featureType}?${featureCode}`,
            {
              params: {
                geometry: '100',
                bufferOutput: buffer.toString()
              }
            }
          )
          .pipe(
            map((featureCollection) => {
              return featureCollection.features.map((f) => {
                f.meta = {
                  id: f.properties.code,
                  alias: f.properties.nom,
                  title: f.properties.nom
                };
                return f;
              });
            })
          );
      }
    } else {
      return this.http.post<Feature[]>(`${this.baseUrl}/geospatial/buffer?`, {
        buffer,
        loc: JSON.stringify(features)
      });
    }
  }
}
