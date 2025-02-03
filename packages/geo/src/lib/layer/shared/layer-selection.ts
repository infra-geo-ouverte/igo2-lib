import { SelectionModel } from '@angular/cdk/collections';

import { isLayerGroup } from '../utils/layer.utils';
import { AnyLayer } from './layers/any-layer';

export class LayerSelectionModel {
  private selection = new SelectionModel<AnyLayer>(true);
  private descendantSelection = new SelectionModel<AnyLayer>(true);

  get selected(): AnyLayer[] {
    return this.selection.selected;
  }

  get hasSelection(): boolean {
    return this.selection.hasValue();
  }

  get isSelectionEmpty(): boolean {
    return this.selection.isEmpty();
  }

  clearSelection(): void {
    this.selection.clear();
    this.descendantSelection.clear();
  }

  select(...layers: AnyLayer[]): void {
    this.selection.select(...layers);
    this.descendantSelection.select(...this.getDescendants(...layers));
  }

  deselect(...layers: AnyLayer[]): void {
    this.selection.deselect(...layers);
    this.descendantSelection.deselect(...this.getDescendants(...layers));
  }

  isSelected = (layer: AnyLayer): boolean => this.selection.isSelected(layer);
  isDescendantSelection = (layer: AnyLayer): boolean =>
    this.descendantSelection.isSelected(layer);

  private getDescendants(...layers: AnyLayer[]): AnyLayer[] {
    return layers.reduce((descendants: AnyLayer[], layer) => {
      if (isLayerGroup(layer)) {
        return descendants.concat(layer.descendants);
      }
      return descendants;
    }, []);
  }
}
