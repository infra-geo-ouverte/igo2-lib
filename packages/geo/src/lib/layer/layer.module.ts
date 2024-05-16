import { ModuleWithProviders, NgModule } from '@angular/core';

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

export const LAYER_DIRECTIVES = [
  LayerItemComponent,
  LayerLegendItemComponent,
  LayerLegendComponent,
  LayerListComponent,
  LayerListToolComponent,
  LayerLegendListComponent,
  LayerListBindingDirective,
  LayerLegendListBindingDirective,
  TrackFeatureButtonComponent
] as const;

/**
 * @deprecated import the components/directives directly or LAYER_DIRECTIVES for the set
 */
@NgModule({
  imports: [
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
