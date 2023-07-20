import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { IgoLanguageModule } from '@igo2/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { IgoStyleListModule } from './style-list/style-list.module';
import { StyleModalDrawingComponent } from './style-modal/drawing/style-modal-drawing.component';
import { StyleModalLayerComponent } from './style-modal/layer/style-modal-layer.component';
import { StyleModalLayerButtonComponent } from './style-modal/layer-button/style-modal-layer-button.component';
import { DrawStyleService } from './style-service/draw-style.service';
import { StyleService } from './style-service/style.service';

@NgModule({
  imports: [
    ColorPickerModule,
    CommonModule,
    FormsModule,
    IgoLanguageModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
    IgoStyleListModule.forRoot()
  ],
  exports: [IgoStyleListModule, StyleModalDrawingComponent, StyleModalLayerComponent, StyleModalLayerButtonComponent],
  declarations: [StyleModalDrawingComponent, StyleModalLayerComponent, StyleModalLayerButtonComponent]
})
export class IgoStyleModule {
  static forRoot(): ModuleWithProviders<IgoStyleModule> {
    return {
      ngModule: IgoStyleModule,
      providers: [StyleService, DrawStyleService]
    };
  }
}
