import { Component } from '@angular/core';

import { Register } from '@igo2/context';

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
