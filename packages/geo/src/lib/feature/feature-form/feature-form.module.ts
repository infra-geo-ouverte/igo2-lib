import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgoFormModule } from '@igo2/common';

import { FeatureFormComponent } from './feature-form.component';

/**
 * @ignore
 */
@NgModule({
  imports: [CommonModule, IgoFormModule],
  exports: [IgoFormModule, FeatureFormComponent],
  declarations: [FeatureFormComponent]
})
export class IgoFeatureFormModule {}
