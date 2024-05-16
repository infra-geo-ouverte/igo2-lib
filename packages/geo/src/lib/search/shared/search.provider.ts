import { Provider } from '@angular/core';

import { provideSearchSourceService } from './search-source-service.providers';
import { SearchService } from './search.service';
import {
  SearchSourceFeature,
  SearchSourceKind
} from './sources/source.interfaces';

interface ISearchProviderOptions {
  /** Share the search term with analytics tracking */
  analytics?: boolean;
}

export function provideSearch(
  sources: SearchSourceFeature<SearchSourceKind>[],
  options?: ISearchProviderOptions
): Provider[] {
  const providers: Provider[] = [
    options?.analytics && {
      provide: 'searchAnalytics',
      useValue: options.analytics
    },
    {
      provide: SearchService,
      useClass: SearchService
    },
    provideSearchSourceService()
  ].filter(Boolean);

  for (const source of sources) {
    providers.push(...source.providers);
  }

  return providers;
}
