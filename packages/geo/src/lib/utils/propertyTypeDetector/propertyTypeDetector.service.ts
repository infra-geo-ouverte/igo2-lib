import { Injectable } from '@angular/core';
import { RegexService } from '@igo2/core';
import { GeoServiceDefinition } from './propertyTypeDetector.interface';

@Injectable({
  providedIn: 'root'
})
export class PropertyTypeDetectorService {
  public geoServiceRegexes: GeoServiceDefinition[] = [];

  constructor(private regexService: RegexService) {
    this.geoServiceRegexes = this.getGeoServiceRegexes();
  }

  getPropertyType(value) {
    return typeof value;
  }

  private isUrl(value): boolean {
    const regex = /^https?:\/\//;
    return regex.test(value.toString());
  }

  isGeoService(value): boolean {
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

  getGeoService(
    url: string,
    availableProperties: string[]
  ): GeoServiceDefinition {
    if (!this.isGeoService(url)) {
      return;
    }
    let matchingGeoservice: GeoServiceDefinition;
    for (const geoServiceRegex of this.geoServiceRegexes) {
      const domainRegex = new RegExp(geoServiceRegex.url);
      if (domainRegex.test(url)) {
        // providing the the first matching regex;
        const matchingProperties = availableProperties.filter((p) =>
          geoServiceRegex.propertiesForLayerName.includes(p)
        );
        matchingGeoservice = matchingProperties ? geoServiceRegex : undefined;
        if (matchingGeoservice) {
          break;
        }
      }
    }
    return matchingGeoservice;
  }

  private getGeoServiceRegexes(): GeoServiceDefinition[] {
    return (this.regexService.get('geoservice') ||
      []) as GeoServiceDefinition[];
  }
}
