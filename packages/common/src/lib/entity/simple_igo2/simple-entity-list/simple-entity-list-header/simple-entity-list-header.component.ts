import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'igo-simple-entity-list-header',
  templateUrl: './simple-entity-list-header.component.html',
  styleUrls: ['./simple-entity-list-header.component.scss']
})
export class SimpleEntityListHeaderComponent implements OnInit {
  @Input() entitiesAll: Array<object>; // an array containing all the entities in the store
  @Input() elementsLowerBound: number; // the lowest index (+ 1) of an element in the current page
  @Input() elementsUpperBound: number; // the highest index (+ 1) of an element in the current page

  public entitiesAllLength: number;

  constructor() {}

  ngOnInit() {
    // get the total number of entities
    this.entitiesAllLength = this.entitiesAll.length;
  }

}
