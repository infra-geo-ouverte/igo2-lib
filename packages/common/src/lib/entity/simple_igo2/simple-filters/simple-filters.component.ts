import { Component, OnInit } from '@angular/core';
import { SimpleFilter } from './simple-filters.interface';
import { ConfigService } from '@igo2/core'

@Component({
  selector: 'igo-simple-filters',
  templateUrl: './simple-filters.component.html',
  styleUrls: ['./simple-filters.component.scss']
})
export class SimpleFiltersComponent implements OnInit {

  public filters: Array<SimpleFilter>;

  constructor(private configService: ConfigService) { }

  ngOnInit(): void {
    this.filters = this.configService.getConfig('simpleFilters');
  }

  resetFilters() {
    console.log('reset filters')
  }

}
