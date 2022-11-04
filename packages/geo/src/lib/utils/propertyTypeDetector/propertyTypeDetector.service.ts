import { Injectable } from '@angular/core';
import { RegexService } from '@igo2/core';
import { GeoServiceDefinition } from './propertyTypeDetector.interface';

@Injectable({
  providedIn: 'root'
})
export class PropertyTypeDetectorService {

  public geoServiceRegexes: GeoServiceDefinition[];

  constructor(
    private regexService: RegexService
  ) {
    this.geoServiceRegexes = this.getGeoServiceRegexes();
  }

  getPropertyType(value) {
    return typeof value;
  }

  private isUrl(value) {
    const regex = /^https?:\/\//;
    return regex.test(value.toString());
  }

  isGeoService(value) {
    let isGeoService = false;
    if (!this.isUrl) {
      return;
    }
    for (const geoServiceRegex of this.geoServiceRegexes) {
      const domainRegex = new RegExp(geoServiceRegex.url);
      if (domainRegex.test(value)) {
        isGeoService = true;
        break;
      }
    }
    return isGeoService;
  }

  getGeoService(value) {
    if (!this.isGeoService(value)) {
      return;
    }
    for (const geoServiceRegex of this.geoServiceRegexes) {
      const domainRegex = new RegExp(geoServiceRegex.url);
      if (domainRegex.test(value)) {
        return geoServiceRegex;
      }
    }
    return;
  }


  private getGeoServiceRegexes() {
    return this.regexService.get('geoservice') as GeoServiceDefinition[] | [];
  }

}
