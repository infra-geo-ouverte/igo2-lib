import { SearchSource } from '../search-sources/search-source';


export function searchSourceServiceFactory(sources: SearchSource[]) {
  return new SearchSourceService(sources);
}

export function provideSearchSourceService() {
  return {
    provide: SearchSourceService,
    useFactory: searchSourceServiceFactory,
    deps: [SearchSource]
  };
}

export class SearchSourceService {

  constructor(public sources: SearchSource[]) { }
}
