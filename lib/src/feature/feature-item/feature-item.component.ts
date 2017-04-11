import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Feature } from '../shared';

@Component({
  selector: 'igo-feature-item',
  templateUrl: './feature-item.component.html',
  styleUrls: ['./feature-item.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureItemComponent {

  @Input()
  get feature(): Feature { return this._feature; }
  set feature(value: Feature) {
    this._feature = value;
  }
  private _feature: Feature;

  constructor() { }

}
