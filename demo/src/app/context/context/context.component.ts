import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { IgoMap, OverlayService, Feature, FeatureService } from '@igo2/geo';
@Component({
  selector: 'app-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss']
})
export class AppContextComponent {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 6
  };

  constructor(
    private languageService: LanguageService,
    private overlayService: OverlayService,
    private featureService: FeatureService
  ) {}

  clearFeature() {
    this.featureService.clear();
    this.overlayService.clear();
  }

  handleQueryResults(results) {
    const features: Feature[] = results.features;
    if (features.length) {
      this.featureService.setFeatures(features);
    }
  }

  handleFeatureFocus(feature: Feature) {
    this.overlayService.setFeatures([feature]);
  }

  handleFeatureSelect(feature: Feature) {
    this.overlayService.setFeatures([feature]);
  }
}
