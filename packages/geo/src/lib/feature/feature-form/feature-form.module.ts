import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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
