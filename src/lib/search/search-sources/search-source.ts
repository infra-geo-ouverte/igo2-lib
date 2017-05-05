import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Message } from '../../core/message';
import { Feature } from '../../feature';

import { SearchSourceOptions } from './search-source.interface';

export let SEARCH_SOURCE_OPTIONS =
  new InjectionToken<SearchSourceOptions>('searchSourceOptions');

export function provideSearchSourceOptions(options: SearchSourceOptions) {
  return {
    provide: SEARCH_SOURCE_OPTIONS,
    useValue: options
  };
}

export abstract class SearchSource {

  abstract getName(): string;

  abstract search(term?: string): Observable<Feature[] | Message[]>

}
