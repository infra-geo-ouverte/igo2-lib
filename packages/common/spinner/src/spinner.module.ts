import { NgModule } from '@angular/core';

import { SpinnerActivityDirective } from './spinner-activity.directive';
import { SpinnerComponent } from './spinner.component';

export const SPINNER_DIRECTIVES = [
  SpinnerActivityDirective,
  SpinnerComponent
] as const;

/**
 * @deprecated import the components/directives directly or SPINNER_DIRECTIVES for every components/directives
 */
@NgModule({
  imports: [...SPINNER_DIRECTIVES],
  exports: [...SPINNER_DIRECTIVES]
})
export class IgoSpinnerModule {}
