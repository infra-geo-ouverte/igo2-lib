import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

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
