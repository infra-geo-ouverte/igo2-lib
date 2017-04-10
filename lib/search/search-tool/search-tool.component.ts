import { Component } from '@angular/core';

import { SearchService } from '../shared';

@Component({
  selector: 'igo-search-tool',
  templateUrl: './search-tool.component.html',
  styleUrls: ['./search-tool.component.styl']
})
export class SearchToolComponent {

  constructor(public searchService: SearchService) { }

}
