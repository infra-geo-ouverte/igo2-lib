import { NgModule } from '@angular/core';

import { DrawComponent } from './draw.component';

/**
 * @deprecated import the DrawComponent directly
 */
@NgModule({
  imports: [DrawComponent],
  exports: [DrawComponent]
})
export class IgoDrawModule {}
