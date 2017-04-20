import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Feature } from '../shared';


@Component({
  selector: 'igo-feature-list-base',
  templateUrl: './feature-list-base.component.html',
  styleUrls: ['./feature-list-base.component.styl']
})
export class FeatureListBaseComponent {

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

  handleFeatureFocus(feature: Feature) {
    this.focus.emit(feature);
  }

  handleFeatureSelect(feature: Feature) {
    this.select.emit(feature);
  }

}
