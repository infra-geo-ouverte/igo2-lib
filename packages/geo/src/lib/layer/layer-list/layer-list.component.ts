import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output
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
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule
} from '@angular/material/tree';

import {
  DropPermission,
  TreeDragDropDirective,
  TreeDropEvent,
  TreeFlatNode
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

type LayerFlatNode<T = AnyLayer> = TreeFlatNode<T>;

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
export class LayerListComponent {
  private messageService = inject(MessageService);

  public toggleOpacity = false;
  isInit: boolean;

  readonly controller = input.required<LayerController>();
  readonly layers = input.required<AnyLayer[]>();
  readonly isDesktop = input<boolean>(undefined);
  readonly isDragDropDisabled = input<boolean>(undefined);
  readonly selectAll = input<boolean>(undefined);
  readonly viewerOptions = input<LayerViewerOptions>(undefined);

  readonly activeChange = output<AnyLayer>();

  private _transformer = (layer: AnyLayer, level: number): LayerFlatNode => {
    return {
      id: layer.id || layer.options.name,
      isGroup: !!isLayerGroup(layer),
      descendantLevels: isLayerGroup(layer)
        ? layer.descendantsLevel
        : undefined,
      level: level,
      data: layer,
      disabled: false
    };
  };

  treeControl = new FlatTreeControl<LayerFlatNode>(
    (node) => node.level,
    (node) => node.isGroup
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.isGroup,
    (node) =>
      (node as LayerGroup).children
        .filter((layer) => layer.showInLayerList)
        .sort((a, b) => a.zIndex + b.zIndex)
  );

  dataSource: MatTreeFlatDataSource<AnyLayer, LayerFlatNode>;

  constructor() {
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener,
      []
    );

    effect(() => this.updateDatasource(this.layers() ?? []));
  }

  isGroup = (_: number, node: LayerFlatNode) => node.isGroup;

  isLayerGroup = isLayerGroup;
  isLayerItem = isLayerItem;

  isSelected = (layer: AnyLayer): boolean =>
    this.controller().isSelected(layer);
  isDescendantSelection = (layer: AnyLayer): boolean =>
    this.controller().isDescendantSelection(layer);

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
    return layer.type === 'raster'
      ? 'raster'
      : layer.id.includes('measure')
        ? 'measure'
        : layer.id.includes('draw')
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

  dropNode({ node, ref, position }: TreeDropEvent<AnyLayer>): void {
    let nodesToDrop = [node.data];

    const controller = this.controller();
    if (controller.hasSelection) {
      // The selection could contains data from the outside the TreeController
      nodesToDrop = controller.selected.filter(
        (layer) => !!this.findNodeByLayerId(layer.id)
      );
    }

    if (node.isGroup) {
      nodesToDrop = nodesToDrop.filter(
        (nodeDrop) => !(node.data as LayerGroup).isDescendant(nodeDrop)
      );
    }

    if (ref.isGroup) {
      const isSelected = nodesToDrop.some((nodeDrop) => nodeDrop.id === ref.id);
      if (isSelected) {
        nodesToDrop = nodesToDrop.filter((nodeDrop) => nodeDrop.id !== ref.id);
      }
    }

    if (!nodesToDrop.includes(node.data)) {
      nodesToDrop.push(node.data);
    }

    switch (position) {
      case 'above':
        controller.moveAbove(ref.data, ...nodesToDrop);
        break;
      case 'inside':
        controller.moveInside(ref.data as LayerGroup, ...nodesToDrop);
        break;

      default:
        controller.moveBelow(ref.data, ...nodesToDrop);
        break;
    }
  }

  dropNodeError(details: DropPermission): void {
    this.messageService.alert(
      details.message,
      'igo.geo.layer.layer',
      null,
      details.params
    );
  }

  dragStart(): void {
    if (this.viewerOptions().mode === 'selection') {
      return;
    }

    this.controller().clearSelection();
  }

  handleNodeToggle(node: LayerFlatNode<LayerGroup>): void {
    node.data.expanded = this.treeControl.isExpanded(node);
  }

  private findNodeByLayerId(id: string): LayerFlatNode | undefined {
    return this.treeControl.dataNodes.find((node) => node.id === id);
  }

  private updateDatasource(layers: AnyLayer[]): void {
    const expansionModel = this.treeControl.expansionModel;
    this.dataSource.data = layers;

    this.isInit
      ? this.restoreModel(expansionModel, (node) =>
          this.treeControl.expand(node)
        )
      : this.expandGroup(layers);

    if (!this.isInit && layers.length) {
      this.isInit = true;
    }
  }

  /** Recursive */
  private expandGroup(layers: AnyLayer[]): void {
    layers.forEach((layer) => {
      if (!isLayerGroup(layer)) {
        return;
      }
      if (layer.expanded) {
        const node = this.findNodeByLayerId(layer.id);
        if (!node) {
          return;
        }
        this.treeControl.expand(node);
      }

      this.expandGroup(layer.children);
    });
  }

  private restoreModel(
    model: SelectionModel<LayerFlatNode>,
    callback: (node: LayerFlatNode) => void
  ) {
    const ids: string[] = Array.from(model['_selection']).map(
      (value) => value['id']
    );
    model.clear();
    this.treeControl.dataNodes.forEach((node) => {
      if (model.isSelected(node) || ids.includes(node.id)) {
        callback(node);
      }
    });
  }
}
