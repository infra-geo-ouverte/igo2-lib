import { NgModule } from '@angular/core';

import { FormGroupComponent } from './form-group.component';

/**
 * @deprecated import the FormGroupComponent directly
 */
@NgModule({
  imports: [FormGroupComponent],
  exports: [FormGroupComponent]
})
export class IgoFormGroupModule {}
