import { ModuleWithProviders, NgModule } from '@angular/core';

import { GeostylerService } from './geostyler-service/geostyler.service';
import { IgoStyleListModule } from './style-list/style-list.module';
import { StyleModalDrawingComponent } from './style-modal/drawing/style-modal-drawing.component';
import { StyleModalLayerButtonComponent } from './style-modal/layer-button/style-modal-layer-button.component';
import { StyleModalLayerComponent } from './style-modal/layer/style-modal-layer.component';
import { DrawStyleService } from './style-service/draw-style.service';
import { StyleService } from './style-service/style.service';

@NgModule({
  imports: [
    IgoStyleListModule.forRoot(),
    StyleModalDrawingComponent,
    StyleModalLayerComponent,
    StyleModalLayerButtonComponent
  ],
  exports: [
    IgoStyleListModule,
    StyleModalDrawingComponent,
    StyleModalLayerComponent,
    StyleModalLayerButtonComponent
  ]
})
export class IgoStyleModule {
  static forRoot(): ModuleWithProviders<IgoStyleModule> {
    return {
      ngModule: IgoStyleModule,
      providers: [StyleService, DrawStyleService, GeostylerService]
    };
  }
}
