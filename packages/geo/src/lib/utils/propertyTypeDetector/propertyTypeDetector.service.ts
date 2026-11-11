import { Injectable, inject } from '@angular/core';

import { RegexService } from '@igo2/core/regex';

import { GeoServiceDefinition } from './propertyTypeDetector.interface';

@Injectable({
  providedIn: 'root'
})
export class PropertyTypeDetectorService {
  private regexService = inject(RegexService);

  public geoServiceRegexes: GeoServiceDefinition[] = [];

  constructor() {
    this.geoServiceRegexes = this.getGeoServiceRegexes();
  }

  getPropertyType(value: unknown) {
    return typeof value;
  }

  private isUrl(value: unknown): boolean {
    const regex = /^https?:\/\//;
    return typeof value === 'string'
      ? regex.test(value)
      : regex.test(String(value));
  }

  isGeoService(value: unknown): boolean {
    let isGeoService = false;
    if (!this.isUrl) {
      return false;
    }
    for (const geoServiceRegex of this.geoServiceRegexes) {
      const domainRegex = new RegExp(geoServiceRegex.url);
      if (domainRegex.test(String(value))) {
        isGeoService = true;
        break;
      }
    }
    return isGeoService;
  }

  getGeoService(
    url: string,
    availableProperties: string[]
  ): GeoServiceDefinition | undefined {
    if (!this.isGeoService(url)) {
      return;
    }
    let matchingGeoservice: GeoServiceDefinition | undefined;
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
