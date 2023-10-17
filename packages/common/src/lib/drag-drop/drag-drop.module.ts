import { ModuleWithProviders, NgModule } from '@angular/core';

import { DragAndDropDirective } from './drag-drop.directive';

@NgModule({
  imports: [],
  declarations: [DragAndDropDirective],
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
