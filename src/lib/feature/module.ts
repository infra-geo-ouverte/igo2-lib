import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { FeatureService, FeatureGroupPipe } from './shared';
import { FeatureDetailsComponent } from './feature-details';
import { FeatureListComponent,
         FeatureListBehaviorDirective } from './feature-list';
import { FeatureItemComponent } from './feature-item';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    FeatureDetailsComponent,
    FeatureListComponent,
    FeatureListBehaviorDirective,
    FeatureItemComponent,
    FeatureGroupPipe
  ],
  declarations: [
    FeatureDetailsComponent,
    FeatureListComponent,
    FeatureListBehaviorDirective,
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

export * from './feature-details';
export * from './feature-list';
export * from './feature-item';
export * from './shared';
