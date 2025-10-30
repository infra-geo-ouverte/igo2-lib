import { ModuleWithProviders, NgModule } from '@angular/core';

import { DrawStyleService } from './draw-style-service/draw-style.service';
import { StyleModalDrawingComponent } from './style-modal/drawing/style-modal-drawing.component';
import { StyleModalLayerButtonComponent } from './style-modal/layer-button/style-modal-layer-button.component';
import { StyleModalLayerComponent } from './style-modal/layer/style-modal-layer.component';

@NgModule({
  imports: [
    StyleModalDrawingComponent,
    StyleModalLayerComponent,
    StyleModalLayerButtonComponent
  ],
  exports: [
    StyleModalDrawingComponent,
    StyleModalLayerComponent,
    StyleModalLayerButtonComponent
  ]
})
export class IgoStyleModule {
  static forRoot(): ModuleWithProviders<IgoStyleModule> {
    return {
      ngModule: IgoStyleModule,
      providers: [DrawStyleService]
    };
  }
}
