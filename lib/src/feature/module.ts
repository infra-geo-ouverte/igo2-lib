import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';

import { IgoSharedModule } from '../shared';

import { FeatureService } from './shared';
import { FeatureDetailsComponent } from './feature-details';
import { FeatureListComponent } from './feature-list';
import { FeatureItemComponent } from './feature-item';


@NgModule({
  imports: [
    IgoSharedModule,
    HttpModule
  ],
  exports: [
    FeatureDetailsComponent,
    FeatureListComponent
  ],
  declarations: [
    FeatureDetailsComponent,
    FeatureListComponent,
    FeatureItemComponent
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
export * from './shared';
