import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatIconModule, MatCardModule } from '@angular/material';

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
    IgoPanelModule,
    IgoToolModule.forRoot()
  ],
  exports: [AppToolComponent],
  entryComponents: [
    AppSalutationToolComponent,
    AppAboutToolComponent
  ]
})
export class AppToolModule {}
