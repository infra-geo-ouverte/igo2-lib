import { ModuleWithProviders, NgModule } from '@angular/core';

import { DragAndDropDirective } from './drag-drop.directive';
import { TreeDragDropDirective } from './tree-drag-drop/tree-drag-drop.directive';

/**
 * @deprecated import the DragAndDropDirective directly
 */
@NgModule({
  imports: [DragAndDropDirective, TreeDragDropDirective],
  exports: [DragAndDropDirective, TreeDragDropDirective]
})
export class IgoDrapDropModule {
  static forRoot(): ModuleWithProviders<IgoDrapDropModule> {
    return {
      ngModule: IgoDrapDropModule,
      providers: []
    };
  }
}
