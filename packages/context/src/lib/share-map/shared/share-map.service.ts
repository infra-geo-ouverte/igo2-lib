import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Params } from '@angular/router';

import { RouteService, RouteServiceOptions } from '@igo2/core/route';
import { AnyLayerOptions, IgoMap } from '@igo2/geo';

import { DetailedContext } from '../../context-manager/shared/context.interface';
import { shareMapKeyDefs } from './share-map-definitions';
import { ShareMapEncoder } from './share-map-encoder';
import { ShareMapParser } from './share-map-parser';
import {
  PositionParams,
  SHARE_MAP_KEYS_DEFAULT_OPTIONS,
  ShareMapKeysDefinitions,
  ShareMapRouteKeysOptions
} from './share-map.interface';

@Injectable({
  providedIn: 'root'
})
export class ShareMapService {
  routeService = inject(RouteService);
  document = inject<Document>(DOCUMENT);

  get language(): string {
    return this._language;
  }
  set language(value: string) {
    this._language = value;
    if (this.encoder) {
      this.encoder.language = value;
    }
  }
  private _language = '';

  options: ShareMapRouteKeysOptions;
  optionsLegacy: RouteServiceOptions;
  keysDefinitions: ShareMapKeysDefinitions;
  private encoder: ShareMapEncoder;
  private parser: ShareMapParser;

  constructor() {
    this.options = SHARE_MAP_KEYS_DEFAULT_OPTIONS;
    this.optionsLegacy = this.routeService.legacyOptions;
    this.keysDefinitions = shareMapKeyDefs({
      ...SHARE_MAP_KEYS_DEFAULT_OPTIONS,
      languageKey: this.routeService.options.languageKey
    });

    this.encoder = new ShareMapEncoder(this.keysDefinitions, this.document);

    this.parser = new ShareMapParser(
      this.keysDefinitions,
      this.routeService.legacyOptions
    );

    this.routeService.queryParams.subscribe((params) => {
      const language = params[this.keysDefinitions.languageKey];
      if (language) {
        this.language = language;
      }
    });
  }

  generateUrl(map: IgoMap, context: DetailedContext): string {
    return this.encoder.generateUrl(map, context);
  }

  parsePosition(params: Params): PositionParams | undefined {
    return this.parser.parsePosition(params);
  }

  parseLayers(params: Params): AnyLayerOptions[] | undefined {
    return this.parser.parseLayers(params);
  }

  sanitizeBaseUrl(baseUrl: string): string {
    const params = this.encoder.getSanitizedParams(baseUrl);
    const [base] = baseUrl.split('?');
    const queryString = params.toString();
    return queryString !== '' ? `${base}?${queryString}&` : `${base}?`;
  }

  getContext(params: Params): string | undefined {
    const legacyKey = this.optionsLegacy.contextKey;
    return (
      params[this.options.context] ??
      (legacyKey ? params[legacyKey] : undefined)
    );
  }

  getZoom(params: Params): number | undefined {
    return this.parsePosition(params)?.zoom;
  }

  getUrlWithApi(formValues: Record<string, string>) {
    const loc = this.document.location;
    const origin = loc.origin;
    const pathname = loc.pathname;
    const search = loc.search;
    const params = new URLSearchParams(search);
    params.set('context', formValues.uri);
    if (this.language) {
      params.set('lang', this.language);
    }
    return `${origin}${pathname}?${params.toString()}`;
  }

  hasPositionParams(params: Params): boolean {
    const { projectionKey, rotationKey, zoomKey, centerKey } =
      this.optionsLegacy;
    const { pos } = this.keysDefinitions;

    return Boolean(
      params[pos.key] ||
      (projectionKey && params[projectionKey]) ||
      (rotationKey && params[rotationKey]) ||
      (zoomKey && params[zoomKey]) ||
      (centerKey && params[centerKey])
    );
  }
}
