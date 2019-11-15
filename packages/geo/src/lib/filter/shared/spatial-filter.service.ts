import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LanguageService } from '@igo2/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Feature } from '../../feature/shared';
import { SpatialFilterQueryType, SpatialFilterItemType } from './spatial-filter.enum';
import { SpatialFilterThematic } from './spatial-filter.interface';

@Injectable({
  providedIn: 'root'
})
export class SpatialFilterService {

  public baseUrl: string = 'https://testgeoegl.msp.gouv.qc.ca/apis/terrapi/';
  public filterList;

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
    RegTour: 'tourisme'
  };

  constructor(
    private http: HttpClient,
    private languageService: LanguageService) {}

    getKeyByValue(object, value) {
      return Object.keys(object).find(key => object[key] === value);
    }

  /*
   * Loading data for spatial filter list component (NO GEOMETRY)
   */
  loadFilterList(type: SpatialFilterQueryType): Observable<Feature[]> {
    const urlPath = type as string;
    if (urlPath) {
      return this.http.get<{features: Feature[]}>(this.baseUrl + this.urlFilterList[urlPath], {
        params: {
          // geometry: "true"
        }
      }).pipe(
        map(featureCollection => featureCollection.features.map(f => {
          f.meta = {
            id: f.properties.code
          };
          return f;
        }))
      );
    }
  }

  /*
   * Loading item list (STRING)
   */
  loadThematicsList() {
    const url = 'types';
    const items: SpatialFilterThematic[] = [];
    return this.http.get(this.baseUrl + url)
      .pipe(
        map((types: string[]) => {
          types.forEach(type => {
            if (type.startsWith('lieux')) {
              const item: SpatialFilterThematic = {
                name: undefined,
                source: type
              };
              let substr = type.substring(6, type.length);
              let name = substr;
              if (substr.includes('.')) {
                const index = substr.indexOf('.');
                name = substr.substring(index + 1, substr.length)
                substr = substr.substring(0, index);
              }
              item.name = this.languageService.translate
                .instant('igo.geo.terrapi.' + name);

              item.group = this.languageService.translate.instant('igo.geo.spatialFilter.group.' + substr);
              items.push(item);
            }
          });
          return items;
        })
      );
  }

  /*
   * Loading data for spatial filter item component (Address or Thematics) depends on predefined zone or draw zone (feature)
   */
  loadFilterItem(feature, itemType: SpatialFilterItemType, type?: SpatialFilterQueryType, thematic?: SpatialFilterThematic, buffer?: number) {
    if (type) { // Predefined type
      const urlType = type as string;
      const url = this.baseUrl + this.urlFilterList[urlType];
      let urlItem = '';
      if (itemType === SpatialFilterItemType.Address) {
        urlItem = '/adresses';
        return this.http.get<{features: Feature[]}>(url + '/' + feature.properties.code + '/' + urlItem, {
          params: {
            geometry: 'true',
            icon: 'true'
          }
        }).pipe(
          map(featureCollection => featureCollection.features.map(f => {
            f.meta = {
              id: f.properties.code,
              title: this.languageService.translate.instant('igo.geo.spatialFilter.Address')
            };
            return f;
          }))
        );
      } else { // If thematics search
        urlItem = thematic.source;
        return this.http.get<{features: Feature[]}>(url + '/' + feature.properties.code + '/' + urlItem, {
          params: {
            geometry: 'true',
            icon: 'true'
          }
        }).pipe(
          map(featureCollection => featureCollection.features.map(f => {
            f.meta = {
              id: f.properties.code,
              title: thematic.name
            };
            return f;
          }))
        );
      }
    } else { // Draw type
      const url = this.baseUrl + 'locate';
      const urlCoord = '&loc=' + JSON.stringify(feature);
      const urlBuffer = buffer ? '&buffer=' + buffer as string : '';
      if (itemType === SpatialFilterItemType.Address) {
        const urlItem = '?type=adresses';
        // const header = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        // let body = new HttpParams();
        // body.set('geometry', 'true');
        // body.set('icon', 'true');
        return this.http.get<{features: Feature[]}>(url + urlItem + urlCoord + urlBuffer, {
          params: {
            geometry: 'true',
            icon: 'true'
          }
        }).pipe(
            map(featureCollection => featureCollection.features.map(f => {
              f.meta = {
                id: f.properties.code,
                title: this.languageService.translate.instant('igo.geo.spatialFilter.Address')
              };
              return f;
            }))
          );
      } else { // If thematics search
        const urlItem = '?type=' + thematic.source;
        return this.http.get<{features: Feature[]}>(url + urlItem + urlCoord + urlBuffer, {
          params: {
            geometry: 'true',
            icon: 'true'
          }
        }).pipe(
          map(featureCollection => featureCollection.features.map(f => {
            f.meta = {
              id: f.properties.code,
              title: thematic.name
            };
            return f;
          }))
        );
      }
    }
  }

  /*
   * Get one territory by id (WITH GEOMETRY)
   */
  loadItemById(feature: Feature, type: SpatialFilterQueryType): Observable<Feature> {
    const featureType = this.urlFilterList[type];
    const featureCode = '/' + feature.properties.code;
    if (featureType && featureCode) {
      return this.http.get<Feature>(this.baseUrl + featureType + featureCode, {
        params: {
          geometry: 'true'
        }
      }).pipe(
        map(f => {
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

}
