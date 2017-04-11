import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Feature, FeatureService } from '../shared';


@Component({
  selector: 'igo-feature-list',
  templateUrl: './feature-list.component.html',
  styleUrls: ['./feature-list.component.styl']
})
export class FeatureListComponent implements OnInit, OnDestroy {

  private features$$: Subscription;
  public sourceFeatures: [string, Feature[]];

  constructor(public featureService: FeatureService) {}

  ngOnInit() {
    this.features$$ = this.featureService.features$
      .subscribe((features: Feature[]) => this.handleFeaturesChanged(features));
  }

  ngOnDestroy() {
    this.features$$.unsubscribe();
  }

  private handleFeaturesChanged(features: Feature[]) {
    const groupedFeatures = {};

    features.forEach((feature: Feature) => {
      const source = feature.source;
      if (groupedFeatures[source] === undefined) {
        groupedFeatures[source] = [];
      }

      groupedFeatures[source].push(feature);
    });

    const sourceFeatures = Object.keys(groupedFeatures).sort().map(
      (source: string) => [source, groupedFeatures[source]]);
    this.sourceFeatures = sourceFeatures as [string, Feature[]];
  }
}
