import { Component, Input, OnInit } from '@angular/core';
import { Feature } from 'geojson';

@Component({
  selector: 'igo-simple-feature-list-header',
  templateUrl: './simple-feature-list-header.component.html',
  styleUrls: ['./simple-feature-list-header.component.scss']
})
export class SimpleFeatureListHeaderComponent implements OnInit {
  @Input() entities: Array<Array<Feature>>; // an array containing all the entities in the store
  @Input() elementsLowerBound: number; // the lowest index (+ 1) of an element in the current page
  @Input() elementsUpperBound: number; // the highest index (+ 1) of an element in the current page

  public entitiesLength: number;

  constructor() {}

  ngOnInit() {
    // get the total number of entities
    this.entitiesLength = this.entities.length;
  }

}
