import { SearchSource } from '../search-sources/search-source';

export class SearchSourceService {

  constructor(public sources: SearchSource[]) { }
}
