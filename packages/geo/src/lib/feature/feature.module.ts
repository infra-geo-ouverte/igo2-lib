import { NgModule } from '@angular/core';

import { IgoFeatureDetailsModule } from './feature-details/feature-details.module';
import { IgoFeatureFormModule } from './feature-form/feature-form.module';

/**
 * @deprecated import the components directly or the FEATURE_DIRECTIVES for the set
 */
@NgModule({
  exports: [IgoFeatureDetailsModule, IgoFeatureFormModule]
})
export class IgoFeatureModule {}
