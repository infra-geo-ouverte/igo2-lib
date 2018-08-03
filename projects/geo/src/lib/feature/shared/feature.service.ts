import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Feature } from './feature.interface';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  public features$ = new BehaviorSubject<Feature[]>([]);
  public focusedFeature$ = new BehaviorSubject<Feature>(undefined);
  public selectedFeature$ = new BehaviorSubject<Feature>(undefined);

  constructor() {}

  setFeatures(features: Feature[]) {
    this.features$.next(features.sort(this.sortFeatures));
  }

  updateFeatures(
    features: Feature[],
    source?: string,
    sourcesToKeep?: string[]
  ) {
    const features_ = this.features$.value
      .filter(feature => {
        return (
          feature.source !== source &&
          (!sourcesToKeep || sourcesToKeep.indexOf(feature.source) !== -1)
        );
      })
      .concat(features)
      .sort(this.sortFeatures);

    this.features$.next(features_);
  }

  clear() {
    this.features$.next([]);
    this.unfocusFeature();
    this.unselectFeature();
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
    if (feature1 === undefined || feature2 === undefined) {
      return false;
    }

    return (
      feature1.id === feature2.id &&
      feature1.source === feature2.source &&
      feature1.properties === feature2.properties
    );
  }

  private sortFeatures(feature1, feature2) {
    return feature1.order - feature2.order;
  }
}
