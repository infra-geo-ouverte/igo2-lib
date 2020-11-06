import { NgModule, ModuleWithProviders } from '@angular/core';
import { ContextMenuDirective } from './context-menu.directive';

@NgModule({
  imports: [],
  declarations: [ContextMenuDirective],
  exports: [ContextMenuDirective]
})
export class IgoContextMenuModule {
  static forRoot(): ModuleWithProviders<IgoContextMenuModule> {
    return {
      ngModule: IgoContextMenuModule,
      providers: []
    };
  }
}
