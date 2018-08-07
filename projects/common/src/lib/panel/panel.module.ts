import { NgModule, ModuleWithProviders } from '@angular/core';
import { PanelComponent } from './panel.component';

@NgModule({
  imports: [],
  declarations: [PanelComponent],
  exports: [PanelComponent]
})
export class IgoPanelModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoPanelModule,
      providers: []
    };
  }
}
