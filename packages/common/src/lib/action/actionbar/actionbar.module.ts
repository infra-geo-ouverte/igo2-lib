import { NgModule } from '@angular/core';

import { ActionbarComponent } from './actionbar.component';

/**
 * @deprecated import the ActionbarComponent directly
 */
@NgModule({
  imports: [ActionbarComponent],
  exports: [ActionbarComponent]
})
export class IgoActionbarModule {}
