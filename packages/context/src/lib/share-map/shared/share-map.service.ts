import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';

import { RouteService, RouteServiceOptions } from '@igo2/core/route';

import { shareMapKeyDefs } from './share-map-definitions';
import { ShareMapEncoder } from './share-map-encoder';
import { ShareMapParser } from './share-map-parser';
import {
  SHARE_MAP_KEYS_DEFAULT_OPTIONS,
  ShareMapKeysDefinitions,
  ShareMapRouteKeysOptions
} from './share-map.interface';

@Injectable({
  providedIn: 'root'
})
export class ShareMapService {
  private language = '';

  options: ShareMapRouteKeysOptions;
  optionsLegacy: RouteServiceOptions;
  keysDefinitions: ShareMapKeysDefinitions;
  encoder: ShareMapEncoder;
  parser: ShareMapParser;

  constructor(
    public routeService: RouteService,
    @Inject(DOCUMENT) public document: Document
  ) {
    this.options = SHARE_MAP_KEYS_DEFAULT_OPTIONS;
    this.optionsLegacy = this.routeService.legacyOptions;
    this.keysDefinitions = shareMapKeyDefs({
      ...SHARE_MAP_KEYS_DEFAULT_OPTIONS,
      languageKey: this.routeService.options.languageKey
    });

    this.encoder = new ShareMapEncoder(this.keysDefinitions, document);

    this.parser = new ShareMapParser(
      this.keysDefinitions,
      this.routeService.legacyOptions
    );

    this.routeService.queryParams.subscribe((params) => {
      const language = this.options.languageKey;
      if (params[language]) {
        this.language = params[language];
      }
    });
  }

  getContext(params: Params): string | undefined {
    return (
      params[this.options.context] ?? params[this.optionsLegacy.contextKey]
    );
  }

  getZoom(params: Params): number | undefined {
    return this.parser.parsePosition(params).zoom;
  }

  getUrlWithApi(formValues) {
    const loc = this.document.location;
    const origin = loc.origin;
    const pathname = loc.pathname;
    return this.language
      ? `${origin + pathname}?context=${formValues.uri}&lang=${this.language}`
      : `${origin + pathname}?context=${formValues.uri}`;
  }

  hasPositionParams(params: Params): boolean {
    const { projectionKey, rotationKey, zoomKey, centerKey } =
      this.optionsLegacy;
    const { pos } = this.keysDefinitions;

    return Boolean(
      params[pos.key] ||
        params[projectionKey] ||
        params[rotationKey] ||
        params[zoomKey] ||
        params[centerKey]
    );
  }
}
