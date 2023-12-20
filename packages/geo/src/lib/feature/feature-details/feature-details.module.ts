import { NgModule } from '@angular/core';

import { FeatureDetailsComponent } from './feature-details.component';
import { FeatureDetailsDirective } from './feature-details.directive';

/**
 * @deprecated import the FeatureDetailsComponent, FeatureDetailsDirective directly or the FEATURE_DETAILS_DIRECTIVES for all
 */
@NgModule({
  imports: [FeatureDetailsComponent, FeatureDetailsDirective],
  exports: [FeatureDetailsComponent, FeatureDetailsDirective]
})
export class IgoFeatureDetailsModule {}
