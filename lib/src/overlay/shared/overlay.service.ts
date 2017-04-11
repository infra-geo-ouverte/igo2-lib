import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { Feature, FeatureService } from '../../feature';

import { OverlayAction } from './overlay.interface';

@Injectable()
export class OverlayService {

  public features$ =
    new BehaviorSubject<[Feature[], OverlayAction]>([undefined, undefined]);
  private focusedFeatures$$: Subscription;
  private selectedFeatures$$: Subscription;

  constructor(private featureService: FeatureService) {
    this.focusedFeatures$$ = this.featureService.focusedFeature$
      .subscribe((feature: Feature) => this.handleFeatureFocus(feature));

    this.selectedFeatures$$ = this.featureService.selectedFeature$
      .subscribe((feature: Feature) => this.handleFeatureSelect(feature));
  }

  setFeatures(features: Feature[], action: OverlayAction = 'none') {
    this.features$.next([features, action]);
  }

  private handleFeatureFocus(feature: Feature) {
    const features = [];
    if (feature !== undefined) {
      features.push(feature);
    }

    this.setFeatures(features, 'move');
  }

  private handleFeatureSelect(feature: Feature) {
    const features = [];
    if (feature !== undefined) {
      features.push(feature);
    }

    this.setFeatures(features, 'zoom');
  }
}
