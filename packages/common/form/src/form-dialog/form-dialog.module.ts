import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { FormStepperComponent } from '../form-stepper/form-stepper.component';
import { FormDialogComponent } from './form-dialog.component';
import { FormDialogService } from './form-dialog.service';
import { FormStepperDialogComponent } from './form-stepper-dialog.component';

/**
 * @deprecated import the FlexibleComponent directly
 */
@NgModule({
  imports: [
    MatDialogModule,
    FormDialogComponent,
    FormStepperComponent,
    FormStepperDialogComponent
  ],
  exports: [
    FormDialogComponent,
    FormStepperComponent,
    FormStepperDialogComponent
  ],
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
