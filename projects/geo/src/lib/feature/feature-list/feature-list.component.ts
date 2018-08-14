import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';

import { Feature } from '../shared/feature.interface';

@Component({
  selector: 'igo-feature-list',
  templateUrl: './feature-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureListComponent {
  private changed = false;

  @Input()
  get features(): Feature[] {
    return this._features;
  }
  set features(value: Feature[]) {
    this.changed = true;
    this._features = value;
    this.cdRef.detectChanges();
  }
  private _features: Feature[] = [];

  @Input()
  get groupFeatures(): Boolean {
    return this._groupFeatures;
  }
  set groupFeatures(value: Boolean) {
    this._groupFeatures = value;
  }
  private _groupFeatures: Boolean = true;

  @Input()
  get display() {
    return this._display;
  }
  set display(value: boolean) {
    this._display = value;
  }
  private _display = true;

  @Input()
  get focusFirst() {
    // Focus on the first item only if the list is changed.
    // After that, the focusedFeature input should be prioritized.
    // This avoids selecting the first item when the focudesFeature
    // is manually set o undefined (meaning it is unselected).
    return this.changed ? this._focusFirst : false;
  }
  set focusFirst(value: boolean) {
    this._focusFirst = value;
  }
  private _focusFirst = true;

  @Input()
  get focusedFeature(): Feature {
    if (!this.featureFound(this._focusedFeature)) {
      return undefined;
    }

    return this._focusedFeature;
  }
  set focusedFeature(value: Feature) {
    if (this.featureFound(value)) {
      this._focusedFeature = value;
    } else {
      this._focusedFeature = undefined;
    }

    // Set the list to changed when the focusedFeature changes
    // only if there is no feature in the list. That way, focusFirst
    // will take effect if true
    this.changed = this._features.length === 0;
    this.cdRef.detectChanges();
  }
  private _focusedFeature: Feature;

  @Output() focus = new EventEmitter<Feature>();
  @Output() select = new EventEmitter<Feature>();
  @Output() unfocus = new EventEmitter<Feature>();
  @Output() unselect = new EventEmitter<Feature>();

  constructor(private cdRef: ChangeDetectorRef) {}

  private featureFound(feature: Feature): boolean {
    if (feature === undefined) {
      return false;
    }

    return (
      this.features.find(
        f => f.id === feature.id && f.source === feature.source
      ) !== undefined
    );
  }
}
