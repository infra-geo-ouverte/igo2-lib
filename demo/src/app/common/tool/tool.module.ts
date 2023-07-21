import { NgModule } from '@angular/core';

import { IgoLanguageModule } from '@igo2/core';
import { IgoPanelModule, IgoToolModule } from '@igo2/common';

import {
  AppToolComponent,
  AppSalutationToolComponent,
  AppAboutToolComponent
} from './tool.component';
import { AppToolRoutingModule } from './tool-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [
        AppToolComponent,
        AppSalutationToolComponent,
        AppAboutToolComponent
    ],
    imports: [
        SharedModule,
        AppToolRoutingModule,
        IgoLanguageModule,
        IgoPanelModule,
        IgoToolModule.forRoot()
    ],
    exports: [AppToolComponent]
})
export class AppToolModule {}
