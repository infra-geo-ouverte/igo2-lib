import { NgModule } from '@angular/core';

import { IgoPanelModule, IgoToolModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { SharedModule } from '../../shared/shared.module';
import { AppToolRoutingModule } from './tool-routing.module';
import {
  AppAboutToolComponent,
  AppSalutationToolComponent,
  AppToolComponent
} from './tool.component';

@NgModule({
  imports: [
    SharedModule,
    AppToolRoutingModule,
    IgoLanguageModule,
    IgoPanelModule,
    IgoToolModule.forRoot(),
    AppToolComponent,
    AppSalutationToolComponent,
    AppAboutToolComponent
  ],
  exports: [AppToolComponent]
})
export class AppToolModule {}
