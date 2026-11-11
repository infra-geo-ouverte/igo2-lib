import type { HttpClient } from '@angular/common/http';

import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import Projection from 'ol/proj/Projection';

import { Observable, Subject, defer } from 'rxjs';

import { OGCFilterService } from '../../../filter/shared/ogc-filter.service';
import { WFSDataSource, buildWfsBatchUrls } from './wfs-datasource';
import { WFSService } from './wfs.service';

describe('buildWfsBatchUrls', () => {
  it('builds stable WFS batch URLs using query params instead of string replacements', () => {
    const urls = buildWfsBatchUrls(
      'https://example.com/wfs?service=WFS&request=GetFeature&count=5000&startIndex=0',
      2500,
      1000
    );

    expect(urls.length).toBe(3);
    expect(urls[0]).toContain('count=1000');
    expect(urls[1]).toContain('startIndex=1000');
    expect(urls[2]).toContain('startIndex=2000');
    expect(urls[2]).toContain('count=500');

    const protocolRelativeUrls = buildWfsBatchUrls(
      '//example.com/wfs?count=2000&startIndex=0',
      2000,
      1000
    );
    expect(protocolRelativeUrls[0]).toMatch(/^\/\/example\.com\/wfs\?/);

    const queryOnlyUrls = buildWfsBatchUrls(
      '?service=WFS&count=2000&startIndex=0',
      2000,
      1000
    );
    expect(queryOnlyUrls[0]).toMatch(/^\?service=WFS&/);
  });

  it('fetches batches in parallel and aggregates them in URL order', () => {
    const dataSource = new WFSDataSource(
      {
        type: 'wfs',
        url: 'https://example.com/wfs',
        params: {
          version: '2.0.0',
          featureTypes: 'test',
          fieldNameGeometry: 'geometry',
          maxFeatures: 6000,
          outputFormat: 'GeoJSON',
          srsName: 'EPSG:3857'
        }
      },
      {} as WFSService,
      new OGCFilterService()
    );
    const batches = Array.from(
      { length: 6 },
      () => new Subject<Feature<Geometry>[]>()
    );
    const subscribedUrls: string[] = [];
    const harness = dataSource as unknown as {
      _fetchFeatures(
        projection: Projection,
        url: string,
        options: unknown
      ): Observable<Feature<Geometry>[]>;
    };
    vi.spyOn(harness, '_fetchFeatures').mockImplementation(
      (_projection, url) => {
        const index =
          Number(new URL(url).searchParams.get('startIndex')) / 1000;
        return defer(() => {
          subscribedUrls.push(url);
          return batches[index];
        });
      }
    );
    const firstFeature = new Feature<Geometry>();
    const secondFeature = new Feature<Geometry>();
    const thirdFeature = new Feature<Geometry>();
    const result = vi.fn();

    dataSource
      .fetchFeatures({
        extent: undefined,
        projection: new Projection({ code: 'EPSG:3857' }),
        httpClient: {} as HttpClient
      })
      .subscribe(result);

    expect(subscribedUrls).toHaveLength(6);
    expect(result).not.toHaveBeenCalled();

    batches[5].next([thirdFeature]);
    batches[5].complete();
    batches[0].next([firstFeature]);
    batches[0].complete();
    batches[1].next([secondFeature]);
    batches[1].complete();
    batches.slice(2, 5).forEach((batch) => {
      batch.next([]);
      batch.complete();
    });

    expect(result).toHaveBeenCalledExactlyOnceWith([
      firstFeature,
      secondFeature,
      thirdFeature
    ]);
  });
});
