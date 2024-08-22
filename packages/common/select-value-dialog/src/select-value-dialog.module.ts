import { ModuleWithProviders, NgModule } from '@angular/core';

import { SelectValueCheckRadioDialogComponent } from './select-value-check-radio-dialog.component';
import { SelectValueDialogService } from './select-value-dialog.service';

@NgModule({
  imports: [SelectValueCheckRadioDialogComponent],
  exports: [SelectValueCheckRadioDialogComponent],
  providers: [SelectValueDialogService]
})
export class IgoSelectValueDialogModule {
  /**
   * @deprecated it has no effect
   */
  static forRoot(): ModuleWithProviders<IgoSelectValueDialogModule> {
    return {
      ngModule: IgoSelectValueDialogModule,
      providers: []
    };
  }
}
