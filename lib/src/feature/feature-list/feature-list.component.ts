import { Component } from '@angular/core';

import { Feature, FeatureService } from '../shared';
import { FeatureListBaseComponent } from './feature-list-base.component';


@Component({
  selector: 'igo-feature-list',
  templateUrl: './feature-list.component.html',
  styleUrls: ['./feature-list.component.styl']
})
export class FeatureListComponent extends FeatureListBaseComponent {

  // Override input features
  public features: Feature[] = [];

  constructor(public featureService: FeatureService) {
    super();
  }

  handleFeatureFocus(feature: Feature) {
    super.handleFeatureFocus(feature);
    this.featureService.focusFeature(feature);
  }

  handleFeatureSelect(feature: Feature) {
    super.handleFeatureSelect(feature);
    this.featureService.selectFeature(feature);
  }

}
