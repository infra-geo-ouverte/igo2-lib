import { Component, Input } from '@angular/core';

import { Feature } from '../shared/feature.interface';

@Component({
  selector: 'igo-feature-details',
  templateUrl: './feature-details.component.html',
  styleUrls: ['./feature-details.component.styl']
})
export class FeatureDetailsComponent {

  @Input()
  get feature(): Feature { return this._feature; }
  set feature(value: Feature) {
    this._feature = value;
  }
  private _feature: Feature;

  constructor() { }

}
