import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import {
  IgoConfirmDialogModule,
  IgoFormDialogModule,
  IgoJsonDialogModule,
  IgoSelectValueDialogModule
} from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { SharedModule } from '../../shared/shared.module';
import { AppDialogRoutingModule } from './dialog-routing.module';
import { AppDialogComponent } from './dialog.component';

@NgModule({
  imports: [
    SharedModule,
    AppDialogRoutingModule,
    IgoConfirmDialogModule,
    IgoSelectValueDialogModule,
    IgoFormDialogModule,
    IgoJsonDialogModule,
    MatButtonModule,
    IgoLanguageModule.forRoot(),
    MatDividerModule,
    AppDialogComponent
  ],
  exports: [AppDialogComponent]
})
export class AppDialogModule {}
