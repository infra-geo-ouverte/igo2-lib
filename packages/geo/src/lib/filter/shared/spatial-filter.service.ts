import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { LanguageService, ConfigService } from '@igo2/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Feature } from '../../feature/shared';
import { SpatialFilterQueryType, SpatialFilterItemType } from './spatial-filter.enum';

@Injectable({
  providedIn: 'root'
})
export class SpatialFilterService {

  public baseUrl: string = 'https://testgeoegl.msp.gouv.qc.ca/apis/terrapi/';
  public filterList;

  /*
   * Type association with URL
   */
  public urlType = {
    'AdmRegion': 'regadmin',
    'Arrond': 'arrondissements',
    'CircFed': 'circ-fed',
    'CircProv': 'circ-prov',
    'DirReg': 'dir-reg',
    'MRC': 'mrc',
    'Mun': 'municipalites',
    'RegTour': 'tourisme',
    'bornes': 'Bornes',
    'hydro': 'Hydrographie',
    'routes': 'Routes',
    'lieux.bati': 'Bâtiments',
    'lieux.geographie': 'Géographie',
    'lieux.parc': 'Parcs',
    'lieux.secteur': 'Secteurs',
    'lieux.culturel.immeubles': 'Immeubles',
    'lieux.culturel.sites': 'Sites culturels',
    'lieux.education.cpe': 'CPE',
    'lieux.education.public': 'Écoles publiques',
    'lieux.education.prive': 'Écoles privé',
    'lieux.education.gouvernemental': 'Écoles gouvernementales',
    'lieux.education.colleges': 'Collèges',
    'lieux.education.universites': 'Universités',
    'lieux.sante.aine': 'Résidences pour aînés',
    'lieux.sante.ambulance': 'Ambulances',
    'lieux.sante.clinique': 'Cliniques',
    'lieux.sante.etabl': 'Établissements santé',
    'lieux.sante.gmf': 'Groupe de médecins de famille',
    'lieux.sante.naissance': 'Naissance',
    'lieux.sante.pharmacie': 'Pharmacie',
    'lieux.securite.correctionnel': 'Centres correctionnels',
    'lieux.securite.organisme': 'Organismes de sécurité',
    'lieux.securite.palais-justice': 'Palais de justice',
    'lieux.securite.penitencier-fed': 'Pénitencier fédéraux',
    'lieux.securite.penitencier-prov': 'Pénitencier provinciaux',
  };

  constructor(
    private http: HttpClient,
    private config: ConfigService,
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
      return this.http.get<{features: Feature[]}>(this.baseUrl + this.urlType[urlPath], {
        params: {
          // geometry: "true"
        }
      }).pipe(
        map(featureCollection => featureCollection.features.map(feature => {
          feature.meta = {
            id: feature.properties.code
          };
          return feature;
        }))
      );
    }
  }

  /*
   * Loading item list (STRING)
   */
  loadItemList() {
    const url = 'types';
    const items: string[] = [];
    return this.http.get(this.baseUrl + url)
      .pipe(
        map((types: string[]) => {
          types.forEach(type => {
            if (this.urlType[type.toString()]) {
              items.push(this.urlType[type.toString()]);
            }
          });
          return items;
        })
      );
  }

  /*
   * Loading data for spatial filter item component (Address or Thematics) depends on predefined zone or draw zone (feature)
   */
  loadFilterItem(feature, itemType: SpatialFilterItemType, type?: SpatialFilterQueryType, thematic?: string, buffer?: number) {
    if (type) {
      const urlType = type as string;
      const url = this.baseUrl + this.urlType[urlType];
      let urlItem = '';
      if (itemType === SpatialFilterItemType.Address) {
        urlItem = '/adresses';
        return this.http.get<{features: Feature[]}>(url + '/' + feature.properties.code + '/' + urlItem, {
          params: {
            geometry: 'true'
          }
        }).pipe(
          map(featureCollection => featureCollection.features.map(feature => {
            feature.meta = {
              id: feature.properties.code,
              title: 'Adresses'
            };
            return feature;
          }))
        );
      } else {
        urlItem = this.getKeyByValue(this.urlType, thematic);
        return this.http.get<{features: Feature[]}>(url + '/' + feature.properties.code + '/' + urlItem, {
          params: {
            geometry: 'true'
          }
        }).pipe(
          map(featureCollection => featureCollection.features.map(feature => {
            feature.meta = {
              id: feature.properties.code,
              title: thematic
            };
            return feature;
          }))
        );
      }
    } else {
      const url = this.baseUrl + 'locate';
      const urlCoord = '&loc=' + JSON.stringify(feature);
      const urlBuffer = buffer ? '&buffer=' + buffer as string : '';
      if (itemType === SpatialFilterItemType.Address) {
        const urlItem = '?type=adresses';
        return this.http.get<{features: Feature[]}>(url + urlItem + urlCoord + urlBuffer, {
          params: {
            geometry: 'true'
          }
        }).pipe(
          map(featureCollection => featureCollection.features.map(feature => {
            feature.meta = {
              id: feature.properties.code,
              title: 'Adresses'
            };
            return feature;
          }))
        );
      } else {
        const urlItem = '?type=' + this.getKeyByValue(this.urlType, thematic);
        return this.http.get<{features: Feature[]}>(url + urlItem + urlCoord + urlBuffer, {
          params: {
            geometry: 'true'
          }
        }).pipe(
          map(featureCollection => featureCollection.features.map(feature => {
            feature.meta = {
              id: feature.properties.code,
              title: thematic
            };
            return feature;
          }))
        );
      }
    }
  }

  /*
   * Get one territory by id (WITH GEOMETRY)
   */
  loadItemById(feature: Feature, type: SpatialFilterQueryType): Observable<Feature> {
    const featureType = this.urlType[type];
    const featureCode = '/' + feature.properties.code;
    if (featureType && featureCode) {
      return this.http.get<Feature>(this.baseUrl + featureType + featureCode, {
        params: {
          geometry: 'true'
        }
      }).pipe(
        map(feature => {
          feature.meta = {
            id: feature.properties.code
          };
          return feature;
        })
      );
    }
  }

}
