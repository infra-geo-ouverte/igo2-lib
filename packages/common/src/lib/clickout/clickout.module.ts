import { NgModule, ModuleWithProviders } from '@angular/core';
import { ClickoutDirective } from './clickout.directive';

@NgModule({
  imports: [],
  declarations: [ClickoutDirective],
  exports: [ClickoutDirective]
})
export class IgoClickoutModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoClickoutModule,
      providers: []
    };
  }
}
