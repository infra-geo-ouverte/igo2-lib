import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';

import { IgoSharedModule } from '../shared';

import { FeatureService } from './shared';
import { FeatureDetailsComponent } from './feature-details';
import { FeatureListComponent } from './feature-list';
import { FeatureItemComponent } from './feature-item';
import { FeatureGroupPipe } from './feature-group';


@NgModule({
  imports: [
    IgoSharedModule,
    HttpModule
  ],
  exports: [
    FeatureDetailsComponent,
    FeatureListComponent,
    FeatureItemComponent,
    FeatureGroupPipe
  ],
  declarations: [
    FeatureDetailsComponent,
    FeatureListComponent,
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
export * from './feature-group';
export * from './shared';
