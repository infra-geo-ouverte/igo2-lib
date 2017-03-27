import { Component } from '@angular/core';

import { SearchService } from '../../lib';

@Component({
  selector: 'igo-demo',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent {

  public searchTerm: string;

  constructor(public searchService: SearchService) {}

  handleSearch(term: string) {
    this.searchTerm = term;
  }
}
