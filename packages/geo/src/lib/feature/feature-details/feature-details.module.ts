import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { IgoLanguageModule } from '@igo2/core';
import { IgoKeyValueModule, IgoImageModule } from '@igo2/common';

import { FeatureDetailsComponent } from './feature-details.component';
import { FeatureDetailsDirective } from './feature-details.directive';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    IgoLanguageModule,
    IgoKeyValueModule,
    IgoImageModule
  ],
  exports: [
    FeatureDetailsComponent,
    FeatureDetailsDirective],
  declarations: [
    FeatureDetailsComponent,
    FeatureDetailsDirective]
})
export class IgoFeatureDetailsModule {}
