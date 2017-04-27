import { Directive, Self, OnInit, OnDestroy,
         HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Feature, FeatureService } from '../shared';
import { FeatureListComponent } from './feature-list.component';


@Directive({
  selector: '[igoFeatureListBinding]'
})
export class FeatureListBindingDirective implements OnInit, OnDestroy {

  private component: FeatureListComponent;
  private features$$: Subscription;
  private focusedFeature$$: Subscription;

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

    // When there are multiple feature list with this directive,
    // selecting moving up and down using the keyboard skips some features.
    // We can bypass this issue using a debounce time. Since
    // having multiple feature list is unusual, no better fix is provided
    // for now.
    this.focusedFeature$$ = this.featureService.focusedFeature$
      .debounceTime(100)
      .subscribe(feature => this.component.focusedFeature = feature);
  }

  ngOnDestroy() {
    this.features$$.unsubscribe();
    this.focusedFeature$$.unsubscribe();
  }

}
