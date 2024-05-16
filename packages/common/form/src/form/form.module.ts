import { NgModule } from '@angular/core';

import { FormComponent } from './form.component';

/**
 * @deprecated import the FormComponent directly
 */
@NgModule({
  imports: [FormComponent],
  exports: [FormComponent]
})
export class IgoFormFormModule {}
