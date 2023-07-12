import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { IgoLanguageModule } from '@igo2/core';
import { IgoPanelModule, IgoToolModule } from '@igo2/common';

import {
  AppToolComponent,
  AppSalutationToolComponent,
  AppAboutToolComponent
} from './tool.component';
import { AppToolRoutingModule } from './tool-routing.module';

@NgModule({
    declarations: [
        AppToolComponent,
        AppSalutationToolComponent,
        AppAboutToolComponent
    ],
    imports: [
        CommonModule,
        AppToolRoutingModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        IgoLanguageModule,
        IgoPanelModule,
        IgoToolModule.forRoot()
    ],
    exports: [AppToolComponent]
})
export class AppToolModule {}
