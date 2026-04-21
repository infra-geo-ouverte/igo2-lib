import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import olLayerVectorTile from 'ol/layer/VectorTile';

import { stylefunction } from 'ol-mapbox-style';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';

import { AnyOlStyle } from '../shared/style.interface';
import { LayerStyle } from '../shared/style.types';
import { StyleEngine } from '../style.service';
import { MapboxLayerStyle, MapboxUrlResponse } from './mapbox.interface';

type MapboxResolvedStyle = {
  style: MapboxUrlResponse;
  spriteBaseUrl?: string;
  spriteJson?: unknown;
};

@Injectable()
export class MapboxService implements StyleEngine<MapboxLayerStyle> {
  private http = inject(HttpClient);

  readonly type = 'Mapbox' as const;

  supports(options: LayerStyle): options is MapboxLayerStyle {
    return options.type === 'Mapbox';
  }

  async getStyle(
    options: MapboxLayerStyle,
    ol?: olLayerVectorTile
  ): Promise<AnyOlStyle> {
    if (!ol) {
      throw new Error(
        'MapboxService.getStyle() requires an ol/layer/VectorTile instance (2nd argument).'
      );
    }

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
      return stylefunction(ol, resolved.style as any, source);
    }

    if (!resolved.spriteJson) {
      return stylefunction(ol, resolved.style as any, source);
    }

    return stylefunction(
      ol,
      resolved.style as any,
      source,
      undefined,
      resolved.spriteJson,
      resolved.spriteBaseUrl + '.png'
    );
  }

  async getLegend(_options: MapboxLayerStyle): Promise<string | undefined> {
    return undefined;
  }

  @Cacheable()
  private getResolvedStyle$(url: string): Observable<MapboxResolvedStyle> {
    return this.http.get<MapboxUrlResponse>(url).pipe(
      switchMap((style) => {
        if (!style?.sprite) return of({ style });

        const spriteBaseUrl = this.toAbsoluteUrl(url, style.sprite);

        return this.getSpriteJson$(spriteBaseUrl).pipe(
          map((spriteJson) => ({ style, spriteBaseUrl, spriteJson })),
          catchError(() => of({ style, spriteBaseUrl }))
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  @Cacheable()
  private getSpriteJson$(spriteBaseUrl: string): Observable<unknown> {
    return this.http
      .get<unknown>(spriteBaseUrl + '.json')
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private toAbsoluteUrl(base: string, maybeRelative: unknown): string {
    const rel = String(maybeRelative);

    if (/^(https?:)?\/\//i.test(rel)) {
      if (rel.startsWith('//')) return window.location.protocol + rel;
      return rel;
    }

    const absoluteBase = /^https?:\/\//i.test(base)
      ? base
      : new URL(base, document.baseURI).toString();

    return new URL(rel, absoluteBase).toString();
  }
}
