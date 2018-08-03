import { Directive, Self, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Feature } from '../../feature/shared/feature.interface';
import { FeatureService } from '../../feature/shared/feature.service';
import { SourceFeatureType } from '../../feature/shared/feature.enum';
import { FeatureListComponent } from '../../feature/feature-list/feature-list.component';

@Directive({
  selector: '[igoSearchBarBinding]'
})
export class SearchBarBindingDirective implements OnInit, OnDestroy {
  private component: FeatureListComponent;
  private features$$: Subscription;

  constructor(
    @Self() component: FeatureListComponent,
    private featureService: FeatureService
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.component.features = [];

    this.features$$ = this.featureService.features$
      .pipe(
        map(features =>
          features.filter(f => f.sourceType === SourceFeatureType.Search)
        )
      )
      .subscribe(features => this.handleFeaturesChange(features));
  }

  ngOnDestroy() {
    this.features$$.unsubscribe();
  }

  private handleFeaturesChange(features: Feature[]) {
    if (features.length > 0) {
      this.component.focusedFeature = undefined;
    }
    this.component.features = features;
  }
}
