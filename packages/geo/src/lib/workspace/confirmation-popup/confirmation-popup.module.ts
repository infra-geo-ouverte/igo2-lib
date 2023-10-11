import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';

import { ConfirmationPopupComponent } from './confirmation-popup.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatButtonToggleModule
  ],
  exports: [ConfirmationPopupComponent],
  declarations: [ConfirmationPopupComponent]
})
export class IgoConfirmationPopupModule {}
