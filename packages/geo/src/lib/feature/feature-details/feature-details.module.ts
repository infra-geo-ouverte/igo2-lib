import { NgModule } from '@angular/core';

import { FeatureDetailsComponent } from './feature-details.component';
import { FeatureDetailsDirective } from './feature-details.directive';

export const FEATURE_DETAILS_DIRECTIVES = [
  FeatureDetailsComponent,
  FeatureDetailsDirective
] as const;

/**
 * @deprecated import the FeatureDetailsComponent, FeatureDetailsDirective directly or the FEATURE_DETAILS_DIRECTIVES for all
 */
@NgModule({
  imports: [...FEATURE_DETAILS_DIRECTIVES],
  exports: [...FEATURE_DETAILS_DIRECTIVES]
})
export class IgoFeatureDetailsModule {}
