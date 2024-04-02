import { ModuleWithProviders, NgModule } from '@angular/core';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog.service';

@NgModule({
  imports: [ConfirmDialogComponent],
  exports: [ConfirmDialogComponent],
  providers: [ConfirmDialogService]
})
export class IgoConfirmDialogModule {
  /**
   * @deprecated this has no effect
   */
  static forRoot(): ModuleWithProviders<IgoConfirmDialogModule> {
    return {
      ngModule: IgoConfirmDialogModule,
      providers: []
    };
  }
}
