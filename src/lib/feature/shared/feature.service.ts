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
    this.focusedFeature$.next(feature);
  }

  selectFeature(feature: Feature) {
    this.selectedFeature$.next(feature);
    this.focusFeature(feature);
  }
}
