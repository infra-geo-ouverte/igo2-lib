import { NgModule } from '@angular/core';

import { FeatureFormComponent } from './feature-form.component';

/**
 * @deprecated import the FeatureFormComponent directly
 */
@NgModule({
  imports: [FeatureFormComponent],
  exports: [FeatureFormComponent]
})
export class IgoFeatureFormModule {}
