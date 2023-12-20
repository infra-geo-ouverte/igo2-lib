import { ModuleWithProviders, NgModule } from '@angular/core';

import { StopDropPropagationDirective } from './stop-drop-propagation.directive';
import { StopPropagationDirective } from './stop-propagation.directive';

/**
 * @deprecated import the components/directives directly or STOP_PROPAGATION_DIRECTIVES for the set
 */
@NgModule({
  imports: [StopDropPropagationDirective, StopPropagationDirective],
  exports: [StopDropPropagationDirective, StopPropagationDirective]
})
export class IgoStopPropagationModule {
  static forRoot(): ModuleWithProviders<IgoStopPropagationModule> {
    return {
      ngModule: IgoStopPropagationModule,
      providers: []
    };
  }
}
