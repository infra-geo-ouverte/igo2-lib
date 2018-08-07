import { NgModule, ModuleWithProviders } from '@angular/core';
import { DragAndDropDirective } from './drag-drop.directive';

@NgModule({
  imports: [],
  declarations: [DragAndDropDirective],
  exports: [DragAndDropDirective]
})
export class IgoDrapDropModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoDrapDropModule,
      providers: []
    };
  }
}
