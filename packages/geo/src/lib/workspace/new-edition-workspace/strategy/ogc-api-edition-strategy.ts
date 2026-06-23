import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

import { GeoJSON } from 'geojson';
import { EntityTableColumn } from 'packages/common/entity/src/shared';
import { Observable, map } from 'rxjs';

import { Feature } from '../../../feature/shared';
import { EditionStrategy, EditionVerb, ItemsQuery } from './edition-strategy';

// import { buildMergePatch } from './patch-diff';

interface OgcApiEditionStrategyConfig {
  baseUrl: string;
  collectionName: string;
  featureIdField?: string;
  verb: EditionVerb; /* todo: default PUT */
  headers: Record<string, string>;
  columns: EntityTableColumn[];
}

export class OgcApiEditionStrategy implements EditionStrategy {
  constructor(
    private http: HttpClient,
    private config: OgcApiEditionStrategyConfig
  ) {}

  getItemsUrl(query: ItemsQuery): string {
    console.log(query);
    return '';
    // itemsUrl() + bbox/limit/offset query params + f=json
  }

  parseItems(response: unknown): Feature[] {
    // map GeoJSON FeatureCollection.features -> igo Feature[]
    console.log(response);
    throw Error('Not implemented');
  }

  create(feature: unknown): Observable<string> {
    // POST itemsUrl(), body = full geo+json Feature, Content-Type application/geo+json
    // -> extract server-assigned id from Location header / response
    console.log(feature);
    throw Error('Not implemented');
  }

  update(source: Feature, target: Feature): Observable<void> {
    switch (this.config.verb) {
      case 'PUT': {
        const url = this.itemUrl(source);
        const body = this.getUpdateBody(source);
        const headers = new HttpHeaders(this.config.headers);

        return this.http
          .request(
            new HttpRequest('PUT', url, body, {
              headers: headers
            })
          )
          .pipe(map(() => {}));
        break;
      }
      case 'PATCH':
        // todo
        // Implement PATCH logic here
        return new Observable<void>((observer) => {
          // Simulate a successful PATCH request
          observer.next();
          observer.complete();
        });
        break;
      default:
        throw Error(`Unknown edition verb: ${this.config.verb}`);
    }
  }

  delete(feature: Feature): Observable<void> {
    // DELETE itemUrl()
    const url = this.itemUrl(feature);
    return this.http
      .request(new HttpRequest('DELETE', url))
      .pipe(map(() => {}));
    // .subscribe({
    //   next: () => {
    //     this._isLoading.set(false);
    //     this.refreshLayer();

    //     this.messageService.success('igo.geo.workspace.deleteSuccess');
    //   },
    //   error: (error: HttpErrorResponse) => {
    //     this._isLoading.set(false);
    //     this.handleEditionError(error);
    //   }
    // });

    // throw Error('Not implemented');
  }

  private itemUrl(feature: Feature): string {
    // `${this.itemsUrl()}/${resolveFeatureIdField(...)-value}`  (Q6: same id as body)

    // const id = resolveFeatureIdField(this.config.featureIdField); // todo
    // if (!id)
    //   throw Error(
    //     'No feature id found for feature with properties ' +
    //       JSON.stringify(feature.properties)
    //   );
    return `${this.itemsUrl()}/${feature.properties.id}`;
  }

  private getUpdateBody(feature: Feature): GeoJSON {
    // TODO support Geometry
    // TODO check if id exists
    return {
      type: 'Feature',
      id: feature.properties.id,
      geometry: feature.geometry as GeoJSON.Geometry,
      properties: feature.properties
    };
  }
}
