import { NgModule } from '@angular/core';

import { HomeButtonComponent } from './home-button.component';

/**
 * @deprecated import the HomeButtonComponent directly
 */
@NgModule({
  imports: [HomeButtonComponent],
  exports: [HomeButtonComponent]
})
export class IgoHomeButtonModule {}
