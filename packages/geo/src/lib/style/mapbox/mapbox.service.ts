import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import olLayerVector from 'ol/layer/Vector';
import olLayerVectorTile from 'ol/layer/VectorTile';

import { stylefunction } from 'ol-mapbox-style';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
  AnyOlStyle,
  EngineLayerStyle,
  StyleEngine
} from '../shared/style.interface';
import { MapboxLayerStyle, MapboxUrlResponse } from './mapbox.interface';

type MapboxResolvedStyle = {
  style: MapboxUrlResponse;
  spriteBaseUrl?: string;
  spriteJson?: Record<string, unknown>;
};

@Injectable()
export class MapboxService implements StyleEngine<MapboxLayerStyle> {
  private http = inject(HttpClient);
  private documentRef = inject(DOCUMENT);

  readonly type = 'Mapbox';

  supports(options: EngineLayerStyle): options is MapboxLayerStyle {
    return options?.type === this.type;
  }

  async getStyle(
    options: MapboxLayerStyle,
    ol: olLayerVectorTile | olLayerVector
  ): Promise<AnyOlStyle> {
    const { url, source } = options.style;

    if (!url?.trim()) {
      throw new Error(
        'MapboxService.getStyle(): options.style.url is required.'
      );
    }
    if (!source?.trim()) {
      throw new Error(
        'MapboxService.getStyle(): options.style.source is required.'
      );
    }

    const resolved = await firstValueFrom(this.getResolvedStyle$(url));

    if (!resolved.spriteBaseUrl) {
      return stylefunction(ol, resolved.style, source);
    }

    if (!resolved.spriteJson) {
      return stylefunction(ol, resolved.style, source);
    }

    return stylefunction(
      ol,
      resolved.style,
      source,
      undefined,
      resolved.spriteJson,
      resolved.spriteBaseUrl + '.png'
    );
  }

  async getLegend(_options: MapboxLayerStyle): Promise<string | undefined> {
    return undefined;
  }

  private getResolvedStyle$(url: string): Observable<MapboxResolvedStyle> {
    return this.http.get<MapboxUrlResponse>(url).pipe(
      switchMap((style) => {
        const sprite = this.normalizeSpriteUrl(style?.sprite);
        if (!sprite) return of({ style });

        const spriteBaseUrl = this.toAbsoluteUrl(url, sprite);

        return this.getSpriteJson$(spriteBaseUrl).pipe(
          map((spriteJson) => ({ style, spriteBaseUrl, spriteJson })),
          catchError(() => of({ style, spriteBaseUrl }))
        );
      })
    );
  }

  private getSpriteJson$(
    spriteBaseUrl: string
  ): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(spriteBaseUrl + '.json');
  }

  private normalizeSpriteUrl(sprite: unknown): string | undefined {
    if (typeof sprite !== 'string') return undefined;

    const value = sprite.trim();
    return value.length > 0 ? value : undefined;
  }

  private toAbsoluteUrl(base: string, url: string): string {
    const urlParsed = url.trim();

    if (urlParsed.startsWith('//')) {
      return this.getProtocolFromBase(base) + urlParsed;
    }

    if (/^https?:\/\//i.test(urlParsed)) {
      return urlParsed;
    }

    const absoluteBase = /^https?:\/\//i.test(base)
      ? base
      : new URL(base, this.getBaseHref()).toString();

    return new URL(urlParsed, absoluteBase).toString();
  }

  private getProtocolFromBase(base: string): string {
    if (/^https?:\/\//i.test(base)) {
      return new URL(base).protocol;
    }

    const protocol = this.documentRef.location.protocol;
    if (typeof protocol === 'string' && protocol.length > 0) {
      return protocol;
    }

    return 'https:';
  }

  private getBaseHref(): string {
    const href = this.documentRef.location.href;
    if (typeof href === 'string' && href.length > 0) {
      return href;
    }

    throw new Error(
      'Cannot resolve relative URL without a runtime location href.'
    );
  }
}
