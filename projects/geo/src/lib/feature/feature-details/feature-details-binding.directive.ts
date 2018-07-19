import { Directive, Self, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FeatureService } from '../shared/feature.service';
import { FeatureDetailsComponent } from './feature-details.component';

@Directive({
  selector: '[igoFeatureDetailsBinding]'
})
export class FeatureDetailsBindingDirective implements OnInit, OnDestroy {
  private component: FeatureDetailsComponent;
  private focusedFeatures$$: Subscription;

  constructor(
    @Self() component: FeatureDetailsComponent,
    private featureService: FeatureService
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.focusedFeatures$$ = this.featureService.focusedFeature$.subscribe(
      feature => (this.component.feature = feature)
    );
  }

  ngOnDestroy() {
    this.focusedFeatures$$.unsubscribe();
  }
}
