import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatInputModule,
  MatFormFieldModule,
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatListModule,
  MatSliderModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import {
  IgoListModule,
  IgoCollapsibleModule,
  IgoImageModule
} from '@igo2/common';

import { LayerService } from './shared/layer.service';
import { StyleService } from './shared/style.service';
import { LayerItemComponent } from './layer-item/layer-item.component';
import { LayerLegendComponent } from './layer-legend/layer-legend.component';
import { LayerListComponent } from './layer-list/layer-list.component';
import { LayerListBindingDirective } from './layer-list/layer-list-binding.directive';

@NgModule({
  imports: [
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatListModule,
    MatSliderModule,
    IgoLanguageModule,
    IgoListModule,
    IgoCollapsibleModule,
    IgoImageModule
  ],
  exports: [
    LayerItemComponent,
    LayerLegendComponent,
    LayerListComponent,
    LayerListBindingDirective
  ],
  declarations: [
    LayerItemComponent,
    LayerLegendComponent,
    LayerListComponent,
    LayerListBindingDirective
  ]
})
export class IgoLayerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoLayerModule,
      providers: [LayerService, StyleService]
    };
  }
}
