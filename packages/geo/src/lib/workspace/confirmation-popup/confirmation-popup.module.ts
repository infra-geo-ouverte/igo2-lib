import { NgModule } from '@angular/core';

import { ConfirmationPopupComponent } from './confirmation-popup.component';

/**
 * @deprecated import the ConfirmationPopupComponent directly
 */
@NgModule({
  imports: [ConfirmationPopupComponent],
  exports: [ConfirmationPopupComponent]
})
export class IgoConfirmationPopupModule {}
