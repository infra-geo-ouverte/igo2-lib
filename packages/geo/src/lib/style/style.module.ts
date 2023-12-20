import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ColorPickerFormFieldComponent } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { IgoStyleListModule } from './style-list/style-list.module';
import { StyleModalDrawingComponent } from './style-modal/drawing/style-modal-drawing.component';
import { StyleModalLayerButtonComponent } from './style-modal/layer-button/style-modal-layer-button.component';
import { StyleModalLayerComponent } from './style-modal/layer/style-modal-layer.component';
import { DrawStyleService } from './style-service/draw-style.service';
import { StyleService } from './style-service/style.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IgoLanguageModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        ReactiveFormsModule,
        ColorPickerFormFieldComponent,
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
      providers: [StyleService, DrawStyleService]
    };
  }
}
