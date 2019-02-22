import { Component } from '@angular/core';

import { Register } from '@igo2/context';

import { SearchResultsToolOptions } from './search-results-tool.interface';

@Register({
  name: 'searchResults',
  title: 'igo.integration.tools.searchResults',
  icon: 'search'
})
@Component({
  selector: 'igo-search-results-tool',
  templateUrl: './search-results-tool.component.html'
})
export class SearchResultsToolComponent {}
