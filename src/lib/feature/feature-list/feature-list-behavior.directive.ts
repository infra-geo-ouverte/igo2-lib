import { Directive, Self, OnInit, OnDestroy,
         HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Feature, FeatureService } from '../shared';
import { FeatureListComponent } from './feature-list.component';


@Directive({
  selector: '[igoFeatureListBehavior]'
})
export class FeatureListBehaviorDirective implements OnInit, OnDestroy {

  private component: FeatureListComponent;
  private features$$: Subscription;

  @HostListener('focus', ['$event']) onFocus(feature: Feature) {
    this.featureService.focusFeature(feature);
  }

  @HostListener('select', ['$event']) onSelect(feature: Feature) {
    this.featureService.selectFeature(feature);
  }

  constructor(@Self() component: FeatureListComponent,
              private featureService: FeatureService) {
    this.component = component;
  }

  ngOnInit() {
    // Override input features
    this.component.features = [];

    this.features$$ = this.featureService.features$
      .subscribe(features => this.component.features = features);
  }

  ngOnDestroy() {
    this.features$$.unsubscribe();
  }

}
