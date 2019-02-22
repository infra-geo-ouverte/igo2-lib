import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoKeyValueModule } from '@igo2/common';

import { FeatureDetailsComponent } from './feature-details.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    IgoLanguageModule,
    IgoKeyValueModule
  ],
  exports: [FeatureDetailsComponent],
  declarations: [FeatureDetailsComponent]
})
export class IgoFeatureDetailsModule {}
