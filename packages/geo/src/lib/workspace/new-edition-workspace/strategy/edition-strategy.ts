import { Observable } from 'rxjs';

import { Feature } from '../../../feature/shared';

// todo: move to shared location
export type EditionVerb = 'PATCH' | 'PUT';

export interface ItemsQuery {
  bbox?: [number, number, number, number];
  limit?: number;
  offset?: number;
}

export interface EditionStrategy {
  getItemsUrl(query: ItemsQuery): string;
  parseItems(response: unknown): Feature[];
  create(feature: Feature): Observable<string>;
  update(feature: Feature, snapshot: Feature ): Observable<void>;
  delete(feature: Feature): Observable<void>;
}
