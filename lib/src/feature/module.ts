import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';

import { IgoSharedModule } from '../shared';

import { FeatureService, FeatureGroupPipe } from './shared';
import { FeatureDetailsComponent } from './feature-details';
import { FeatureListComponent,
         FeatureListBaseComponent } from './feature-list';
import { FeatureItemComponent } from './feature-item';


@NgModule({
  imports: [
    IgoSharedModule,
    HttpModule
  ],
  exports: [
    FeatureDetailsComponent,
    FeatureListComponent,
    FeatureListBaseComponent,
    FeatureItemComponent,
    FeatureGroupPipe
  ],
  declarations: [
    FeatureDetailsComponent,
    FeatureListComponent,
    FeatureListBaseComponent,
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
