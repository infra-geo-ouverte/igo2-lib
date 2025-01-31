import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { RouteService, RouteServiceOptions } from '@igo2/core';

import { shareMapKeyDefs } from '../../share-map/shared/share-map-definitions';
import { ShareMapParser } from '../../share-map/shared/share-map-parser';
import { ShareMapKeysDefinitions } from '../../share-map/shared/share-map.interface';
import {
  CONTEXT_ROUTE_KEYS_OPTIONS,
  contextRouteKeysOptions
} from './context.interface';

@Injectable({
  providedIn: 'root'
})
export class ContextRouteService {
  public options: contextRouteKeysOptions;
  public optionsLegacy: RouteServiceOptions;
  public shareMapKeyDefs: ShareMapKeysDefinitions;
  parser: ShareMapParser;

  constructor(
    private routeService: RouteService,
    public route: ActivatedRoute
  ) {
    this.options = CONTEXT_ROUTE_KEYS_OPTIONS;
    this.optionsLegacy = this.routeService.legacyOptions;
    this.shareMapKeyDefs = shareMapKeyDefs({
      ...CONTEXT_ROUTE_KEYS_OPTIONS,
      languageKey: this.routeService.options.languageKey
    });

    this.parser = new ShareMapParser(
      this.shareMapKeyDefs,
      this.routeService.legacyOptions
    );
  }

  getContext(params: Params): string | undefined {
    return (
      params[this.optionsLegacy.contextKey] ?? params[this.options.context]
    );
  }

  getZoom(params: Params): number | undefined {
    return this.parser.parsePosition(params).zoom;
  }
}
