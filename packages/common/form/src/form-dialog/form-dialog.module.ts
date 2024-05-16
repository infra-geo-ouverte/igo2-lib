import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { FormDialogComponent } from './form-dialog.component';
import { FormDialogService } from './form-dialog.service';

/**
 * @deprecated import the FlexibleComponent directly
 */
@NgModule({
  imports: [MatDialogModule, FormDialogComponent],
  exports: [FormDialogComponent],
  providers: [FormDialogService]
})
export class IgoFormDialogModule {
  /**
   * @deprecated it has no effect
   */
  static forRoot(): ModuleWithProviders<IgoFormDialogModule> {
    return {
      ngModule: IgoFormDialogModule,
      providers: []
    };
  }
}
