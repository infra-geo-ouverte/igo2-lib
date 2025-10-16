import { Component, inject, input, output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderChange, MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FormDialogService } from '@igo2/common/form';
import { PanelComponent } from '@igo2/common/panel';
import { IgoLanguageModule } from '@igo2/core/language';

import * as olextent from 'ol/extent';

import type { MapBase } from '../../map/shared/map.abstract';
import { LayerListToolService } from '../layer-list-tool';
import { LayerViewerOptions } from '../layer-viewer/layer-viewer.interface';
import { LayerController } from '../shared/layer-controller';
import type { AnyLayer, LayerGroup } from '../shared/layers';
import {
  LinkedProperties,
  isLayerLinked,
  isLayerLinkedTogether
} from '../shared/layers/linked';
import { isBaseLayer, isLayerGroup, isLayerItem } from '../utils/layer.utils';

@Component({
  selector: 'igo-layer-viewer-bottom-actions',
  templateUrl: './layer-viewer-bottom-actions.component.html',
  styleUrls: ['./layer-viewer-bottom-actions.component.scss'],
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatSliderModule,
    IgoLanguageModule,
    PanelComponent
  ],
  providers: [LayerListToolService, FormDialogService]
})
export class LayerViewerBottomActionsComponent {
  private layerListToolService = inject(LayerListToolService);

  orderable = true;

  readonly map = input.required<MapBase>();
  readonly controller = input.required<LayerController>();
  readonly searchTerm = input.required<string>();
  readonly viewerOptions = input<LayerViewerOptions>(undefined);

  readonly layerChange = output();

  get layersFlattened() {
    return this.controller().layersFlattened;
  }

  get hasMultipleSelection() {
    return this.controller().selected.length > 1;
  }

  get selected() {
    return this.controller().selected;
  }

  get opacity() {
    return Math.round(this.selected[0].opacity * 100);
  }
  set opacity(opacity: number) {
    this.selected[0].opacity = opacity / 100;
  }

  get allSelectionVisibilityHidden(): boolean {
    return this.controller().selected.every((layer) => !layer.visible);
  }

  get isSelectionRaisable(): boolean {
    return this.controller().selected.every((layer) => this.isRaisable(layer));
  }
  get isSelectionLowerable(): boolean {
    return this.controller().selected.every((layer) => this.isLowerable(layer));
  }

  get canRename(): boolean {
    if (!this.viewerOptions().group?.canRename || this.selected.length > 1) {
      return false;
    }

    const layer = this.selected[0];
    return isLayerGroup(layer);
  }

  isLayerItem = isLayerItem;

  handleRename(): void {
    const layer = this.selected[0] as LayerGroup;
    this.layerListToolService.renameGroup(layer).subscribe((name) => {
      if (!name) {
        return;
      }
      layer.title = name;
      this.layerChange.emit();
    });
  }

  isLayersRemovable(layers: AnyLayer[]): boolean {
    if (layers.length === 1) {
      return this.isLayerRemovable(layers[0]);
    }
    return layers?.every((l) => this.isLayerRemovable(l));
  }

  removeLayers(): void {
    this.controller().remove(...this.selected);
    this.controller().clearSelection();
  }

  isExtentsValid(): boolean {
    let valid = false;
    const layersExtent = olextent.createEmpty();
    const maxLayerZoomExtent = this.map().viewController.maxLayerZoomExtent;
    if (
      this.selected.some(
        (layer) =>
          isLayerItem(layer) && layer.options.showButtonZoomToExtent === false
      )
    ) {
      return false;
    }

    for (const layer of this.selected) {
      const layerExtent = layer.options.extent;

      if (layerExtent && !layerExtent.includes(Infinity)) {
        olextent.extend(layersExtent, layerExtent);
      }
    }

    if (!olextent.isEmpty(layersExtent)) {
      if (maxLayerZoomExtent) {
        valid = olextent.containsExtent(maxLayerZoomExtent, layersExtent);
      } else {
        valid = true;
      }
    }
    return valid;
  }
  zoomLayersExtents(): void {
    const layersExtent = olextent.createEmpty();

    for (const layer of this.selected) {
      const layerExtent = layer.options.extent;

      if (layerExtent) {
        olextent.extend(layersExtent, layerExtent);
      }
    }
    this.map().viewController.zoomToExtent(
      layersExtent as [number, number, number, number]
    );
  }

  raiseSelection(): void {
    this.map().layerController.raise(...this.selected);
  }

  lowerSelection(): void {
    this.map().layerController.lower(...this.selected);
  }

  changeOpacity(event: MatSliderChange): void {
    this.opacity = event.value;
  }

  toggleSelectionVisibility(): void {
    this.selected.forEach((layer) => {
      layer.visible = !layer.visible;
    });
    this.layerChange.emit();
  }

  private isLowerable(layer: AnyLayer): boolean {
    if (isBaseLayer(layer)) {
      return false;
    }
    const recipient = this.getRecipientOfVisibleLayer(layer);
    const index = recipient.findIndex((lay) => lay.id === layer.id);
    if (index >= recipient.length - 1) {
      return false;
    }

    if (isLayerLinked(layer)) {
      const layerBelow = recipient[index + 1];
      return !isLayerLinkedTogether(
        layer,
        layerBelow,
        this.controller().layersFlattened,
        LinkedProperties.ZINDEX
      );
    }

    return true;
  }

  private isRaisable(layer: AnyLayer): boolean {
    if (isBaseLayer(layer)) {
      return false;
    }
    const recipient = this.getRecipientOfVisibleLayer(layer);
    const index = recipient.findIndex((lay) => lay.id === layer.id);
    if (index <= 0) {
      return false;
    }

    if (isLayerLinked(layer)) {
      const layerAbove = recipient[index - 1];
      return !isLayerLinkedTogether(
        layer,
        layerAbove,
        this.controller().layersFlattened,
        LinkedProperties.ZINDEX
      );
    }

    return true;
  }

  private getRecipientOfVisibleLayer(layer: AnyLayer): AnyLayer[] {
    return [...this.controller().getLayerRecipient(layer)].filter(
      (layer) => layer.showInLayerList
    );
  }

  private isLayerRemovable(layer: AnyLayer): boolean {
    if (isLayerGroup(layer)) {
      return true;
    }
    return layer.options.removable !== false;
  }
}
