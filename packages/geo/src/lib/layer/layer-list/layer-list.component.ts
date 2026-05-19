import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTree, MatTreeModule } from '@angular/material/tree';

import {
  DropPermission,
  ITreeConfig,
  TreeDragDropDirective,
  TreeDropEvent
} from '@igo2/common/drag-drop';
import { IconSvg, VECTOR_SQUARE_ICON } from '@igo2/common/icon';
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';

import { LayerGroupComponent } from '../layer-group';
import { LayerItemComponent } from '../layer-item';
import type { LayerViewerOptions } from '../layer-viewer/layer-viewer.interface';
import { LayerType } from '../shared';
import type { LayerController } from '../shared/layer-controller';
import type { AnyLayer } from '../shared/layers/any-layer';
import type { Layer } from '../shared/layers/layer';
import type { LayerGroup } from '../shared/layers/layer-group';
import { isLayerGroup, isLayerItem } from '../utils/layer.utils';

@Component({
  selector: 'igo-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatBadgeModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatSliderModule,
    MatTreeModule,
    MatTooltipModule,
    TreeDragDropDirective,
    LayerGroupComponent,
    LayerItemComponent,
    IgoLanguageModule
  ]
})
export class LayerListComponent implements AfterViewInit {
  private messageService = inject(MessageService);

  toggleOpacity = false;

  expansionKey = (node: AnyLayer) => String(node.id);

  readonly controller = input.required<LayerController>();
  readonly layers = input.required<AnyLayer[]>();
  readonly isDesktop = input<boolean>();
  readonly isDragDropDisabled = input<boolean>();
  readonly selectAll = input<boolean>();
  readonly viewerOptions = input<LayerViewerOptions>();

  readonly activeChange = output<AnyLayer>();

  readonly tree = viewChild<MatTree<AnyLayer, string>>(MatTree);

  childrenAccessor = (layer: AnyLayer) => {
    if (isLayerGroup(layer)) {
      return layer.children
        .filter((l) => l.showInLayerList)
        .sort((a, b) => (a.zIndex ?? 0) + (b.zIndex ?? 0));
    }
    return [];
  };

  treeConfig: ITreeConfig<AnyLayer> = {
    isGroup: (layer) => isLayerGroup(layer),
    descendantLevels: (layer) =>
      isLayerGroup(layer) ? layer.descendantsLevel : undefined
  };
  isNodeGroup = (_: number, node: AnyLayer) => isLayerGroup(node);
  isLayerGroup = isLayerGroup;
  isLayerItem = isLayerItem;

  isSelected = (layer: AnyLayer): boolean =>
    this.controller().isSelected(layer);
  isDescendantSelection = (layer: AnyLayer): boolean =>
    this.controller().isDescendantSelection(layer);

  ngAfterViewInit(): void {
    const layers = this.layers();
    const tree = this.tree();

    if (tree && layers) {
      this.expandGroup(layers, tree);
    }
  }

  toggleActive(layer: AnyLayer): void {
    const isSelected = this.controller().isSelected(layer);

    this.controller().clearSelection();

    if (!isSelected) {
      this.controller().select(layer);
    }
    this.activeChange.emit(layer);
  }

  handleSelect(checked: boolean, layer: AnyLayer): void {
    checked
      ? this.controller().select(layer)
      : this.controller().deselect(layer);
  }

  getLayerType(layer: Layer): LayerType | 'measure' | 'draw' {
    const id = layer.id!.toString();
    return layer.type === 'raster'
      ? 'raster'
      : id.includes('measure')
        ? 'measure'
        : id.includes('draw')
          ? 'draw'
          : 'vector';
  }

  getLayerIcon(layer: Layer): string | IconSvg {
    const type = this.getLayerType(layer);
    return type === 'raster'
      ? layer.baseLayer
        ? 'wallpaper'
        : 'image'
      : type === 'measure'
        ? 'square_foot'
        : type === 'draw'
          ? 'draw'
          : VECTOR_SQUARE_ICON;
  }

  trackByFn(_index: number, node: AnyLayer): string {
    return String(node.id);
  }

  dropNode(event: TreeDropEvent<AnyLayer>): void {
    const { node, ref, position } = event;
    let nodesToDrop = [node];

    const controller = this.controller();
    if (controller.hasSelection) {
      nodesToDrop = controller.selected;
    }

    if (isLayerGroup(node)) {
      nodesToDrop = nodesToDrop.filter(
        (nodeDrop) => !node.isDescendant(nodeDrop)
      );
    }

    if (isLayerGroup(ref)) {
      const isSelected = nodesToDrop.some((nodeDrop) => nodeDrop.id === ref.id);
      if (isSelected) {
        nodesToDrop = nodesToDrop.filter((nodeDrop) => nodeDrop.id !== ref.id);
      }
    }

    if (!nodesToDrop.includes(node)) {
      nodesToDrop.push(node);
    }

    switch (position) {
      case 'above':
        controller.moveAbove(ref, ...nodesToDrop);
        break;
      case 'inside':
        controller.moveInside(ref as LayerGroup, ...nodesToDrop);
        break;

      default:
        controller.moveBelow(ref, ...nodesToDrop);
        break;
    }
  }

  dropNodeError(details: DropPermission): void {
    this.messageService.alert(
      details.message!,
      'igo.geo.layer.layer',
      undefined,
      details.params
    );
  }

  dragStart(): void {
    if (this.viewerOptions()?.mode === 'selection') {
      return;
    }

    this.controller().clearSelection();
  }

  handleNodeToggle(node: AnyLayer): void {
    if (!isLayerGroup(node)) {
      return;
    }

    const tree = this.tree();
    tree!.toggle(node);
    node.expanded = tree!.isExpanded(node);
  }

  private expandGroup(
    layers: AnyLayer[],
    tree: MatTree<AnyLayer, string>
  ): void {
    layers.forEach((layer) => {
      if (!isLayerGroup(layer)) {
        return;
      }
      if (layer.expanded) {
        tree.expand(layer);
      }

      this.expandGroup(layer.children, tree);
    });
  }
}
