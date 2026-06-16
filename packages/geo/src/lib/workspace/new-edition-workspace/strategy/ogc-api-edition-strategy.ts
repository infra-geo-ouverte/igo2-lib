import { HttpClient, HttpRequest } from '@angular/common/http';

import { Observable, map } from 'rxjs';

import { Feature } from '../../../feature/shared';
import { EditionStrategy, EditionVerb } from './edition-strategy';
import { resolveFeatureIdField } from './feature-id';

// import { buildMergePatch } from './patch-diff';

export class OgcApiEditionStrategy implements EditionStrategy {
  constructor(
    private http: HttpClient,
    private config: {
      baseUrl: string;
      collectionName: string;
      featureIdField?: string;
      verb: EditionVerb; /* todo: default PUT */
    }
  ) {}

  //   getItemsUrl(query: ItemsQuery): string {
  //     // itemsUrl() + bbox/limit/offset query params + f=json

  //   }

  parseItems(response): Feature[] {
    // map GeoJSON FeatureCollection.features -> igo Feature[]
    throw Error('Not implemented');
  }

  create(feature): Observable<string> {
    // POST itemsUrl(), body = full geo+json Feature, Content-Type application/geo+json
    // -> extract server-assigned id from Location header / response
    throw Error('Not implemented');
  }

  update(edit): Observable<void> {
    // verb === 'PUT'  -> PUT itemUrl(), full Feature body (id from same field as URL)
    // verb === 'PATCH'-> PATCH itemUrl(), buildMergePatch(working, snapshot)
    throw Error('Not implemented');
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

  private itemsUrl(): string {
    return `${this.config.baseUrl}/collections/${this.config.collectionName}/items`;
  }
  private itemUrl(feature: Feature): string {
    // `${this.itemsUrl()}/${resolveFeatureIdField(...)-value}`  (Q6: same id as body)
    const id = resolveFeatureIdField(this.config, feature.columns);
    if (!id)
      throw Error(
        'No feature id found for feature with properties ' +
          JSON.stringify(feature.properties)
      );
    return `${this.itemsUrl()}/${feature.properties[id]}`;
  }
}
