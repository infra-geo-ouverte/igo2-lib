import { LayerItemComponent } from './layer-item';
import { LayerLegendComponent } from './layer-legend';
import { LayerLegendItemComponent } from './layer-legend-item';
import {
  LayerLegendListBindingDirective,
  LayerLegendListComponent
} from './layer-legend-list';
import { LayerListBindingDirective, LayerListComponent } from './layer-list';
import { LayerListToolComponent } from './layer-list-tool';
import { TrackFeatureButtonComponent } from './track-feature-button';

export * from './shared';
export * from './layer-item';
export * from './layer-legend';
export * from './layer-legend-item';
export * from './layer-legend-list';
export * from './layer-list';
export * from './layer-list-tool';
export * from './track-feature-button';
export * from './utils';

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
