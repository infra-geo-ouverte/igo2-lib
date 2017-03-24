import { Component } from '@angular/core';

@Component({
  selector: 'igo-demo',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl']
})
export class AppComponent {
  public searchTerm: string;

  handleSearch(term: string) {
    this.searchTerm = term;
  }
}
