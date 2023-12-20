import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  IgoCollapsibleModule,
  IgoCustomHtmlModule,
  IgoImageModule,
  IgoListModule,
  IgoMatBadgeIconModule,
  PanelComponent
} from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { StyleService } from '../style/style-service/style.service';
import { LayerItemComponent } from './layer-item/layer-item.component';
import { LayerLegendItemComponent } from './layer-legend-item/layer-legend-item.component';
import { LayerLegendListBindingDirective } from './layer-legend-list/layer-legend-list-binding.directive';
import { LayerLegendListComponent } from './layer-legend-list/layer-legend-list.component';
import { LayerLegendComponent } from './layer-legend/layer-legend.component';
import { LayerListToolComponent } from './layer-list-tool/layer-list-tool.component';
import { LayerListToolService } from './layer-list-tool/layer-list-tool.service';
import { LayerListBindingDirective } from './layer-list/layer-list-binding.directive';
import { LayerListComponent } from './layer-list/layer-list.component';
import { LayerService } from './shared/layer.service';
import { TrackFeatureButtonComponent } from './track-feature-button/track-feature-button.component';

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
    IgoLanguageModule,
    IgoListModule,
    IgoCollapsibleModule,
    IgoImageModule,
    PanelComponent,
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
