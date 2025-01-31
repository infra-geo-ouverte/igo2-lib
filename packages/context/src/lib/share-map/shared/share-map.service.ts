import { DOCUMENT, Location } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { RouteService } from '@igo2/core/route';

import { ContextRouteService } from '../../context-manager/shared/context-route.service';
import { ShareMapEncoder } from './share-map-encoder';
import { ShareMapParser } from './share-map-parser';

@Injectable({
  providedIn: 'root'
})
export class ShareMapService {
  private language = '';

  encoder: ShareMapEncoder;
  parser: ShareMapParser;

  constructor(
    public contextRouteService: ContextRouteService,
    public location: Location,
    public route: RouteService,
    @Inject(DOCUMENT) public document: Document
  ) {
    const keysDefinitions = this.contextRouteService.shareMapKeyDefs;

    this.encoder = new ShareMapEncoder(keysDefinitions, location, document);

    this.parser = new ShareMapParser(keysDefinitions, this.route.legacyOptions);

    this.route.queryParams.subscribe((params) => {
      const language = this.contextRouteService.options.languageKey;
      if (params[language]) {
        this.language = params[language];
      }
    });
  }

  getUrlWithApi(formValues) {
    const origin = this.document.location.origin;
    const pathname = this.location.path(false);
    return this.language
      ? `${origin + pathname}?context=${formValues.uri}&lang=${this.language}`
      : `${origin + pathname}?context=${formValues.uri}`;
  }
}
