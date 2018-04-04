import { Directive, Self, OnInit, OnDestroy,
         HostListener } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { filter } from 'rxjs/operators/filter';
import { debounceTime } from 'rxjs/operators/debounceTime';

import { Feature, FeatureService } from '../shared';
import { FeatureListComponent } from './feature-list.component';


@Directive({
  selector: '[igoFeatureListBinding]'
})
export class FeatureListBindingDirective implements OnInit, OnDestroy {

  private component: FeatureListComponent;
  private features$$: Subscription;
  private focusedFeature$$: Subscription;
  private initialized: boolean = false;

  @HostListener('focus', ['$event']) onFocus(feature: Feature) {
    if (this.initialized || this.featureService.focusedFeature$.value === undefined) {
      this.featureService.focusFeature(feature);
    }
  }

  @HostListener('select', ['$event']) onSelect(feature: Feature) {
    if (this.initialized || this.featureService.selectedFeature$.value === undefined) {
      this.featureService.selectFeature(feature);
    }
  }

  constructor(@Self() component: FeatureListComponent,
              private featureService: FeatureService) {
    this.component = component;
  }

  ngOnInit() {
    // Override input features
    this.component.features = [];

    this.features$$ = this.featureService.features$
      .subscribe(features => this.handleFeaturesChange(features));

    // When there are multiple feature list with this directive,
    // selecting moving up and down using the keyboard skips some features.
    // We can bypass this issue using a debounce time. Since
    // having multiple feature list is unusual, no better fix is provided
    // for now.
    this.focusedFeature$$ = this.featureService.focusedFeature$.pipe(
      filter(feature => feature !== undefined),
      debounceTime(100)
    ).subscribe(feature => this.component.focusedFeature = feature);

    this.initialized = true;
  }

  ngOnDestroy() {
    this.features$$.unsubscribe();
    this.focusedFeature$$.unsubscribe();
  }

  private handleFeaturesChange(features: Feature[]) {
    // If the features change but are not cleared completely,
    // we unfocus the focused feature to let the list
    // focus on the first item. This is useful when
    // the focused item can still be found in the new features.
    // In this case, the first item would not be focused, unless
    // it was the focused feature itself.
    if (features.length > 0) {
      this.component.focusedFeature = undefined;
    }
    this.component.features = features;
  }

}
