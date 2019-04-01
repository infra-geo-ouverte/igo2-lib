import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';

import {
  IgoActionModule,
  IgoEntityModule,
  IgoEditionModule,
  IgoPanelModule
} from '@igo2/common';
import {
  IgoMapModule,
  IgoWfsModule
} from '@igo2/geo';

import { AppWfsBrowserComponent } from './wfs-browser.component';
import { AppWfsBrowserRoutingModule } from './wfs-browser-routing.module';

@NgModule({
  declarations: [AppWfsBrowserComponent],
  imports: [
    CommonModule,
    AppWfsBrowserRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoActionModule,
    IgoEntityModule,
    IgoEditionModule,
    IgoPanelModule,
    IgoMapModule,
    IgoWfsModule
  ],
  exports: [AppWfsBrowserComponent]
})
export class AppWfsBrowserModule {}
