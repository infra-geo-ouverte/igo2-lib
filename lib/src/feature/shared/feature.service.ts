import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Feature } from './feature.interface';


@Injectable()
export class FeatureService {

  public features$ = new BehaviorSubject<Feature[]>([]);

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
}
