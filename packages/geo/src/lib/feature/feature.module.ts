import { NgModule } from '@angular/core';

import { FEATURE_DETAILS_DIRECTIVES } from './feature-details';
import { FeatureFormComponent } from './feature-form/feature-form.component';

export const FEATURE_DIRECTIVES = [
  ...FEATURE_DETAILS_DIRECTIVES,
  FeatureFormComponent
] as const;

/**
 * @deprecated import the components directly or the FEATURE_DIRECTIVES for the set
 */
@NgModule({
  imports: [...FEATURE_DIRECTIVES],
  exports: [...FEATURE_DIRECTIVES]
})
export class IgoFeatureModule {}
