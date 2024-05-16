import { ModuleWithProviders, NgModule } from '@angular/core';

import { DragAndDropDirective } from './drag-drop.directive';

/**
 * @deprecated import the DragAndDropDirective directly
 */
@NgModule({
  imports: [DragAndDropDirective],
  exports: [DragAndDropDirective]
})
export class IgoDrapDropModule {
  static forRoot(): ModuleWithProviders<IgoDrapDropModule> {
    return {
      ngModule: IgoDrapDropModule,
      providers: []
    };
  }
}
