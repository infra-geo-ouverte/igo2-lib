import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService, LanguageService } from '@igo2/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Feature } from '../../feature/shared';
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
  public baseUrl: string = 'https://geoegl.msp.gouv.qc.ca/apis/terrapi/';

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
    bornes: 'bornes-sumi',
    hydro: 'hydro',
    routes: 'routes'
  };

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    private configService: ConfigService
  ) {
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
        .get<{ features: Feature[] }>(
          this.baseUrl + this.urlFilterList[urlPath]
        )
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
    return this.http.get(this.baseUrl + url).pipe(
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
            } catch (e) {
              item.name =
                name.substring(0, 1).toUpperCase() +
                name.substring(1, name.length - 1);
            }

            try {
              item.group = this.languageService.translate.instant(
                'igo.geo.spatialFilter.group.' + substr
              );
            } catch (e) {
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
              } catch (e) {
                item.name =
                  name.substring(0, 1).toUpperCase() +
                  name.substring(1, name.length - 1);
              }
              item.source = type;

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
  loadFilterItem(
    feature,
    itemType: SpatialFilterItemType,
    type?: SpatialFilterQueryType,
    thematic?: SpatialFilterThematic,
    buffer?: number
  ) {
    if (type) {
      // Predefined type
      const urlType = type as string;
      const url = this.baseUrl + this.urlFilterList[urlType];
      let urlItem = '';
      if (itemType === SpatialFilterItemType.Address) {
        urlItem = 'adresses';
        return this.http
          .get<{ features: Feature[] }>(
            url + '/' + feature.properties.code + '/' + urlItem,
            {
              params: {
                geometry: 'true',
                icon: 'true',
                bufferInput: buffer.toString(),
                simplified: '100'
              }
            }
          )
          .pipe(
            map((featureCollection) =>
              featureCollection.features.map((f) => {
                f.meta = {
                  id: f.properties.code,
                  title: this.languageService.translate.instant(
                    'igo.geo.spatialFilter.Address'
                  ),
                  icon: (f as any).icon
                };
                return f;
              })
            )
          );
      } else {
        // If thematics search
        urlItem = thematic.source;
        return this.http
          .get<{ features: Feature[] }>(
            url + '/' + feature.properties.code + '/' + urlItem,
            {
              params: {
                geometry: 'true',
                icon: 'true',
                bufferInput: buffer.toString(),
                simplified: '100'
              }
            }
          )
          .pipe(
            map((featureCollection) =>
              featureCollection.features.map((f) => {
                f.meta = {
                  id: f.properties.code,
                  title: thematic.name,
                  icon: (f as any).icon
                };
                return f;
              })
            )
          );
      }
    } else {
      // Draw type
      const url = this.baseUrl + 'locate';
      if (itemType === SpatialFilterItemType.Address) {
        const urlItem = '?type=adresses';
        return this.http
          .post<{ features: Feature[] }>(url + urlItem, {
            geometry: 'true',
            icon: 'true',
            loc: JSON.stringify(feature),
            bufferInput: buffer.toString(),
            simplified: '100'
          })
          .pipe(
            map((featureCollection) =>
              featureCollection.features.map((f) => {
                f.meta = {
                  id: f.properties.code,
                  title: this.languageService.translate.instant(
                    'igo.geo.spatialFilter.Address'
                  ),
                  icon: (f as any).icon
                };
                return f;
              })
            )
          );
      } else {
        // If thematics search
        const urlItem = '?type=' + thematic.source;
        return this.http
          .post<{ features: Feature[] }>(url + urlItem, {
            geometry: 'true',
            icon: 'true',
            loc: JSON.stringify(feature),
            bufferInput: buffer.toString(),
            simplified: '100'
          })
          .pipe(
            map((featureCollection) =>
              featureCollection.features.map((f) => {
                f.meta = {
                  id: f.properties.code,
                  title: thematic.name,
                  icon: (f as any).icon
                };
                return f;
              })
            )
          );
      }
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
    const featureCode = '/' + feature.properties.code;
    if (featureType && featureCode) {
      return this.http
        .get<Feature>(this.baseUrl + featureType + featureCode, {
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
      const featureCode = '/' + feature.properties.code;
      if (featureType && featureCode) {
        return this.http
          .get<Feature>(this.baseUrl + featureType + featureCode, {
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
        .post<Feature>(this.baseUrl + 'geospatial/buffer?', {
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
}
