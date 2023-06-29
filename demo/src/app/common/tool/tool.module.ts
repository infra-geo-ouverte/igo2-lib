import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
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
