import { ModuleWithProviders, NgModule } from '@angular/core';

import { ContextMenuDirective } from './context-menu.directive';
import { LongPressDirective } from './long-press.directive';

@NgModule({
  imports: [ContextMenuDirective, LongPressDirective],
  exports: [ContextMenuDirective, LongPressDirective]
})
export class IgoContextMenuModule {
  static forRoot(): ModuleWithProviders<IgoContextMenuModule> {
    return {
      ngModule: IgoContextMenuModule,
      providers: []
    };
  }
}
