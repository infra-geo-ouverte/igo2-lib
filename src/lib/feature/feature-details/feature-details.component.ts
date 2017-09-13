import { Component, Input, ChangeDetectionStrategy,
         ChangeDetectorRef } from '@angular/core';

import { Feature } from '../shared';

@Component({
  selector: 'igo-feature-details',
  templateUrl: './feature-details.component.html',
  styleUrls: ['./feature-details.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureDetailsComponent {

  @Input()
  get feature(): Feature { return this._feature; }
  set feature(value: Feature) {
    this._feature = value;
    this.cdRef.detectChanges();
  }
  private _feature: Feature;

  constructor(private cdRef: ChangeDetectorRef) { }

  isObject(value) {
    return typeof value === 'object';
  }

}
