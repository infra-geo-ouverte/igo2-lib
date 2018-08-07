import { NgModule, ModuleWithProviders } from '@angular/core';
import { StopDropPropagationDirective } from './stop-drop-propagation.directive';
import { StopPropagationDirective } from './stop-propagation.directive';

@NgModule({
  imports: [],
  declarations: [StopDropPropagationDirective, StopPropagationDirective],
  exports: [StopDropPropagationDirective, StopPropagationDirective]
})
export class IgoStopPropagationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoStopPropagationModule,
      providers: []
    };
  }
}
