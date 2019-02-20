import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeatureDetailsComponent } from './feature-details.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule
  ],
  exports: [FeatureDetailsComponent],
  declarations: [FeatureDetailsComponent]
})
export class IgoFeatureDetailsModule {}
