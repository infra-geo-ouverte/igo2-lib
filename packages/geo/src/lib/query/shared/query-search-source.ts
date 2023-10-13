import { Inject, Injectable } from '@angular/core';

import { FEATURE } from '../../feature/shared/feature.enums';
import { SearchSource } from '../../search/shared/sources/source';
import { SearchSourceOptions } from '../../search/shared/sources/source.interfaces';

/**
 * Map search source. For now it has no search capability. All it does
 * is act as a placeholder for the map query results' "search source".
 */
@Injectable()
export class QuerySearchSource extends SearchSource {
  static id = 'map';
  static type = FEATURE;

  constructor(@Inject('options') options: SearchSourceOptions) {
    super(options);
  }

  getId(): string {
    return QuerySearchSource.id;
  }

  getType(): string {
    return QuerySearchSource.type;
  }

  getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'Carte'
    };
  }
}
