import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Feature } from './feature.interface';


@Injectable()
export class FeatureService {

  public features$ = new BehaviorSubject<Feature[]>([]);
  public focusedFeature$ = new BehaviorSubject<Feature>(undefined);
  public selectedFeature$ = new BehaviorSubject<Feature>(undefined);

  constructor() { }

  setFeatures(features: Feature[]) {
    this.features$.next(features);
  }

  updateFeatures(features: Feature[], source: string) {
    const features_ = this.features$.value
      .filter(feature => feature.source !== source)
      .concat(features);

    this.features$.next(features_);
  }

  clear() {
    this.features$.next([]);
  }

  focusFeature(feature: Feature) {
    if (!this.featuresAreTheSame(feature, this.focusedFeature$.value)) {
      this.focusedFeature$.next(feature);
    }
  }

  selectFeature(feature: Feature) {
    if (!this.featuresAreTheSame(feature, this.selectedFeature$.value)) {
      this.selectedFeature$.next(feature);
    }
    this.focusFeature(feature);
  }

  unfocusFeature() {
    this.focusFeature(undefined);
  }

  unselectFeature() {
    this.selectFeature(undefined);
  }

  featuresAreTheSame(feature1, feature2) {
    if (feature1 === undefined || feature2 === undefined) { return false; }

    return feature1.id === feature2.id && feature1.source === feature2.source;
  }

}
