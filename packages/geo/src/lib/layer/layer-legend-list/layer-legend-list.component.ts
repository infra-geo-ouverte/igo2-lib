import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ListComponent, ListItemDirective } from '@igo2/common/list';
import { IgoLanguageModule } from '@igo2/core/language';

import { LayerLegendItemComponent } from '../layer-legend-item/layer-legend-item.component';
import { AnyLayer } from '../shared/layers/any-layer';
import { isBaseLayer, isLayerItem, sortLayersByZindex } from '../utils';

@Component({
  selector: 'igo-layer-legend-list',
  templateUrl: './layer-legend-list.component.html',
  styleUrls: ['./layer-legend-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule,
    ListComponent,
    LayerLegendItemComponent,
    ListItemDirective,
    IgoLanguageModule
  ]
})
export class LayerLegendListComponent {
  orderable = true;
  hasVisibleOrInRangeLayers = signal<boolean>(true);
  hasVisibleAndNotInRangeLayers = signal<boolean>(true);
  layersInUi = signal<AnyLayer[]>([]);
  layersLegend = signal<AnyLayer[]>([]);
  showAllLegend = false;

  readonly layers = model<AnyLayer[]>(undefined);

  readonly excludeBaseLayers = input(false);

  readonly updateLegendOnResolutionChange = input(false);

  readonly allowShowAllLegends = input(false);

  showAllLegendsValue = model(false);

  readonly allLegendsShown = output<boolean>();

  isLayerItem = isLayerItem;
  constructor() {
    effect(() => {
      const layers = this.computeShownLayers(this.layers());
      this.handleLayersChange(layers);
    });
  }

  private handleLayersChange(layers: AnyLayer[]) {
    this.layersLegend.set(layers);
    const layersValue = this.layers();

    this.hasVisibleOrInRangeLayers.set(
      layersValue
        .filter((layer) => !isBaseLayer(layer))
        .filter((layer) => layer.displayed).length > 0
    );

    this.hasVisibleAndNotInRangeLayers.set(
      layersValue
        .filter((layer) => !isBaseLayer(layer))
        .filter((layer) => layer.visible && !layer.isInResolutionsRange)
        .length > 0
    );

    this.layersInUi.set(
      layersValue.filter(
        (layer) =>
          layer.showInLayerList !== false &&
          (!this.excludeBaseLayers() || !isBaseLayer(layer))
      ) ?? []
    );
  }

  private computeShownLayers(layers: AnyLayer[]) {
    let shownLayers = layers.filter((layer) => layer.displayed);
    if (this.showAllLegendsValue()) {
      shownLayers = layers;
    }
    return sortLayersByZindex(shownLayers, 'desc');
  }

  toggleShowAllLegends(toggle: boolean) {
    this.showAllLegendsValue.set(toggle);
    this.allLegendsShown.emit(toggle);
  }

  // Allow external directives to override layers without assigning to readonly input
  setLayers(layers: AnyLayer[]) {
    this.layers.set(layers ?? []);
  }
}
