import { NgModule } from '@angular/core';

import { PrintFormComponent } from './print-form/print-form.component';
import { PrintComponent } from './print/print.component';

/**
 * @deprecated import the PrintComponent, PrintFormComponent directly
 */
@NgModule({
  imports: [PrintComponent, PrintFormComponent],
  exports: [PrintComponent, PrintFormComponent]
})
export class IgoPrintModule {}
