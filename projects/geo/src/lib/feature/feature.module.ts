import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatIconModule,
  MatListModule,
  MatTooltipModule
} from '@angular/material';

import {
  IgoKeyValueModule,
  IgoCollapsibleModule,
  IgoListModule
} from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { FeatureGroupPipe } from './shared/feature-group.pipe';
import { FeatureDetailsBindingDirective } from './feature-details/feature-details-binding.directive';
import { FeatureDetailsComponent } from './feature-details/feature-details.component';
import { FeatureListBindingDirective } from './feature-list/feature-list-binding.directive';
import { FeatureListComponent } from './feature-list/feature-list.component';
import { FeatureItemComponent } from './feature-item/feature-item.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    IgoKeyValueModule,
    IgoCollapsibleModule,
    IgoListModule,
    IgoLanguageModule
  ],
  exports: [
    FeatureDetailsComponent,
    FeatureDetailsBindingDirective,
    FeatureListComponent,
    FeatureListBindingDirective,
    FeatureItemComponent,
    FeatureGroupPipe
  ],
  declarations: [
    FeatureDetailsComponent,
    FeatureDetailsBindingDirective,
    FeatureListComponent,
    FeatureListBindingDirective,
    FeatureItemComponent,
    FeatureGroupPipe
  ]
})
export class IgoFeatureModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoFeatureModule
    };
  }
}
