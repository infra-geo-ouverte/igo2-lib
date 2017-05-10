import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { FeatureService, FeatureGroupPipe } from './shared';
import { FeatureDetailsComponent,
         FeatureDetailsBindingDirective } from './feature-details';
import { FeatureListComponent,
         FeatureListBindingDirective } from './feature-list';
import { FeatureItemComponent } from './feature-item';


@NgModule({
  imports: [
    IgoSharedModule
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
      ngModule: IgoFeatureModule,
      providers: [
        FeatureService
      ]
    };
  }
}
