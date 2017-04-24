import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Feature } from '../shared';


@Component({
  selector: 'igo-feature-list',
  templateUrl: './feature-list.component.html',
  styleUrls: ['./feature-list.component.styl']
})
export class FeatureListComponent {

  @Input()
  get features(): Feature[] { return this._features; }
  set features(value: Feature[]) {
    this._features = value;
  }
  private _features: Feature[];

  @Input()
  get focusFirst() { return this._focusFirst; }
  set focusFirst(value: boolean) {
    this._focusFirst = value;
  }
  private _focusFirst: boolean = true;

  @Output() focus = new EventEmitter<Feature>();
  @Output() select = new EventEmitter<Feature>();

  constructor() {}

}
