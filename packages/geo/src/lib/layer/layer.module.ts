import { ModuleWithProviders, NgModule } from '@angular/core';

import { FormDialogService } from '@igo2/common/form';

import { StyleService } from '../style/style-service/style.service';
import { LayerGroupComponent } from './layer-group/layer-group.component';
import { LayerItemComponent } from './layer-item/layer-item.component';
import { LayerLegendItemComponent } from './layer-legend-item/layer-legend-item.component';
import { LayerLegendListBindingDirective } from './layer-legend-list/layer-legend-list-binding.directive';
import { LayerLegendListComponent } from './layer-legend-list/layer-legend-list.component';
import { LayerLegendComponent } from './layer-legend/layer-legend.component';
import { LayerListToolComponent } from './layer-list-tool/layer-list-tool.component';
import { LayerListToolService } from './layer-list-tool/layer-list-tool.service';
import { LayerListComponent } from './layer-list/layer-list.component';
import { LayerSearchComponent } from './layer-search/layer-search.component';
import { LayerUnavailableListComponent } from './layer-unavailable/layer-unavailable-list/layer-unavailable-list.component';
import { LayerUnavailableComponent } from './layer-unavailable/layer-unavailable.component';
import { LayerViewerBottomActionsComponent } from './layer-viewer-bottom-actions/layer-viewer-bottom-actions.component';
import { LayerViewerComponent } from './layer-viewer/layer-viewer.component';
import { LayerVisibilityButtonComponent } from './layer-visibility-button/layer-visibility-button.component';
import { LayerService } from './shared/layer.service';
import { TrackFeatureButtonComponent } from './track-feature-button/track-feature-button.component';

export const LAYER_DIRECTIVES = [
  LayerItemComponent,
  LayerLegendItemComponent,
  LayerLegendComponent,
  LayerListComponent,
  LayerListToolComponent,
  LayerLegendListComponent,
  LayerLegendListBindingDirective,
  TrackFeatureButtonComponent,
  LayerGroupComponent,
  LayerViewerComponent,
  LayerUnavailableComponent,
  LayerVisibilityButtonComponent,
  LayerSearchComponent,
  LayerViewerBottomActionsComponent,
  LayerUnavailableListComponent
] as const;

/**
 * @deprecated import the components/directives directly or LAYER_DIRECTIVES for the set
 */
@NgModule({
  imports: [...LAYER_DIRECTIVES],
  exports: [...LAYER_DIRECTIVES],
  providers: [FormDialogService]
})
export class IgoLayerModule {
  static forRoot(): ModuleWithProviders<IgoLayerModule> {
    return {
      ngModule: IgoLayerModule,
      providers: [
        LayerService,
        StyleService,
        FormDialogService,
        LayerListToolService
      ]
    };
  }
}
