import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { ColorPickerModule } from 'ngx-color-picker';

import { IgoLanguageModule } from '@igo2/core';
import {
  IgoListModule,
  IgoCollapsibleModule,
  IgoImageModule,
  IgoPanelModule,
  IgoMatBadgeIconModule,
  IgoCustomHtmlModule
} from '@igo2/common';

import { LayerService } from './shared/layer.service';
import { StyleService } from '../style/style-service/style.service';
import { LayerListToolService } from './layer-list-tool/layer-list-tool.service';
import { LayerItemComponent } from './layer-item/layer-item.component';
import { LayerLegendComponent } from './layer-legend/layer-legend.component';
import { LayerListComponent } from './layer-list/layer-list.component';
import { LayerListToolComponent } from './layer-list-tool/layer-list-tool.component';
import { LayerListBindingDirective } from './layer-list/layer-list-binding.directive';
import { LayerLegendListBindingDirective } from './layer-legend-list/layer-legend-list-binding.directive';
import { TrackFeatureButtonComponent } from './track-feature-button/track-feature-button.component';
import { LayerLegendListComponent } from './layer-legend-list/layer-legend-list.component';
import { LayerLegendItemComponent } from './layer-legend-item/layer-legend-item.component';

@NgModule({
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CommonModule,
    FormsModule,
    MatDividerModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatTooltipModule,
    MatListModule,
    MatSliderModule,
    MatBadgeModule,
    MatCheckboxModule,
    ColorPickerModule,
    IgoLanguageModule,
    IgoListModule,
    IgoCollapsibleModule,
    IgoImageModule,
    IgoPanelModule,
    IgoMatBadgeIconModule,
    IgoCustomHtmlModule
  ],
  exports: [
    LayerItemComponent,
    LayerLegendItemComponent,
    LayerLegendComponent,
    LayerListComponent,
    LayerListToolComponent,
    LayerLegendListComponent,
    LayerListBindingDirective,
    LayerLegendListBindingDirective,
    TrackFeatureButtonComponent
  ],
  declarations: [
    LayerItemComponent,
    LayerLegendItemComponent,
    LayerLegendComponent,
    LayerListComponent,
    LayerListToolComponent,
    LayerLegendListComponent,
    LayerListBindingDirective,
    LayerLegendListBindingDirective,
    TrackFeatureButtonComponent
  ]
})
export class IgoLayerModule {
  static forRoot(): ModuleWithProviders<IgoLayerModule> {
    return {
      ngModule: IgoLayerModule,
      providers: [LayerService, StyleService, LayerListToolService]
    };
  }
}
