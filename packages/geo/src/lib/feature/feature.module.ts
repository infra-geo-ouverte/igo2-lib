import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoFeatureDetailsModule } from './feature-details/feature-details.module';
import { IgoFeatureFormModule } from './feature-form/feature-form.module';

@NgModule({
  imports: [CommonModule],
  exports: [IgoFeatureDetailsModule, IgoFeatureFormModule],
  declarations: [],
  providers: []
})
export class IgoFeatureModule {}
