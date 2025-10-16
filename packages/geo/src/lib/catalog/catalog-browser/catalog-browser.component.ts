import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  model
} from '@angular/core';

import { EntityStore, EntityStoreWatcher } from '@igo2/common/entity';
import { ListComponent, ListItemDirective } from '@igo2/common/list';

import { BehaviorSubject, zip } from 'rxjs';

import { Layer, isLayerItem } from '../../layer';
import { LayerService } from '../../layer/shared/layer.service';
import { IgoMap } from '../../map/shared/map';
import {
  AddedChangeEmitter,
  AddedChangeGroupEmitter,
  Catalog,
  CatalogItem,
  CatalogItemGroup,
  CatalogItemLayer,
  CatalogItemState,
  CatalogItemType
} from '../shared';
import { CatalogBrowserGroupComponent } from './catalog-browser-group.component';
import { CatalogBrowserLayerComponent } from './catalog-browser-layer.component';

/**
 * Component to browse a catalog's groups and layers and display them on a map.
 */
@Component({
  selector: 'igo-catalog-browser',
  templateUrl: './catalog-browser.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ListComponent,
    CatalogBrowserGroupComponent,
    CatalogBrowserLayerComponent,
    ListItemDirective,
    AsyncPipe
  ]
})
export class CatalogBrowserComponent implements OnInit, OnDestroy {
  private layerService = inject(LayerService);
  private cdRef = inject(ChangeDetectorRef);

  /**
   * Catalog items store watcher
   */
  private watcher: EntityStoreWatcher<CatalogItem>;

  // private resolution$$: Subscription;

  get resolution$(): BehaviorSubject<number> {
    return this.map().viewController.resolution$;
  }

  readonly catalogAllowLegend = model(false);

  /**
   * Catalog
   */
  readonly catalog = input<Catalog>(undefined);

  /**
   * Store holding the catalog's items
   */
  readonly store = input<EntityStore<CatalogItem, CatalogItemState>>(undefined);

  /**
   * Map to add the catalog items to
   */
  readonly map = input<IgoMap>(undefined);

  /**
   * Whether a group can be toggled when it's collapsed
   */
  readonly toggleCollapsedGroup = input(true);

  /**
   * @internal
   */
  ngOnInit() {
    const currentItems = this.map()
      .layerController.all.filter((layer) => isLayerItem(layer))
      .map((layer: Layer) => {
        return {
          id: layer.options.source.id,
          title: layer.title,
          type: CatalogItemType.Layer
        };
      });
    this.store().state.updateMany(currentItems, { added: true }, true);
    const catalog = this.catalog();
    if (catalog && catalog.sortDirection !== undefined) {
      this.store().view.sort({
        direction: catalog.sortDirection,
        valueAccessor: (item: CatalogItem) => item.title
      });
    }

    const catalogShowLegend = catalog ? catalog.showLegend : false;
    this.catalogAllowLegend.set(
      catalogShowLegend ? catalogShowLegend : this.catalogAllowLegend()
    );

    this.watcher = new EntityStoreWatcher(this.store(), this.cdRef);
  }

  ngOnDestroy() {
    this.watcher.destroy();
  }

  /**
   * @internal
   */
  isGroup(item: CatalogItem): boolean {
    return item.type === CatalogItemType.Group;
  }

  /**
   * @internal
   */
  isLayer(item: CatalogItem): boolean {
    return item.type === CatalogItemType.Layer;
  }

  /**
   * When a layer is added or removed, add or remove it from the map
   * @internal
   * @param event Layer added event
   */
  onLayerAddedChange(event: AddedChangeEmitter) {
    const layer = event.layer;
    this.store().state.update(layer, { added: event.added }, false);
    event.added
      ? this.addLayerToMap(layer, event)
      : this.removeLayerFromMap(layer);
  }

  /**
   * When a froup is added or removed, add or remove it from the map
   * @internal
   * @param event Group added event
   */
  onGroupAddedChange(event: AddedChangeGroupEmitter) {
    const group = event.group;
    this.store().state.update(group, { added: event.added }, false);
    event.added
      ? this.addGroupToMap(group, event)
      : this.removeGroupFromMap(group);
  }

  /**
   * Add layer to map
   * @param layer Catalog layer
   */
  private addLayerToMap(layer: CatalogItemLayer, event?: AddedChangeEmitter) {
    this.addLayersToMap([layer], event);
  }

  /**
   * Remove layer from map
   * @param layer Catalog layer
   */
  private removeLayerFromMap(layer: CatalogItemLayer) {
    this.removeLayersFromMap([layer]);
  }

  /**
   * Add multiple layers to map
   * @param layers Catalog layers
   */
  private addLayersToMap(
    catalogLayers: CatalogItemLayer[],
    event: AddedChangeEmitter | AddedChangeGroupEmitter
  ) {
    const layers$ = catalogLayers.map((layer) => {
      if (!layer.options.sourceOptions.optionsFromApi) {
        layer.options.sourceOptions.optionsFromApi = true;
      }
      const catalog = this.catalog();
      if (catalog.profils?.length) {
        layer.options.security = { profils: catalog.profils };
      }
      return this.layerService.createAsyncLayer(layer.options);
    });
    zip(...layers$).subscribe((layers) => {
      if (event.event.type === 'click' && event.added) {
        this.map().layersAddedByClick$.next(layers);
      }
      this.store().state.updateMany(catalogLayers, { added: true });
      this.map().layerController.add(...layers.filter(Boolean));
    });
  }

  /**
   * Remove multiple layers from map
   * @param layers Catalog layers
   */
  private removeLayersFromMap(layers: CatalogItemLayer[]) {
    layers.forEach((layer: CatalogItemLayer) => {
      this.store().state.update(layer, { added: false });
      if (layer.options.baseLayer === true) {
        const currLayer = this.map().layerController.getById(
          String(layer.options.id)
        );
        if (currLayer !== undefined) {
          this.map().layerController.remove(currLayer);
        }
      } else {
        const currLayer = this.map().layerController.getById(layer.id);
        if (currLayer !== undefined) {
          this.map().layerController.remove(currLayer);
        }
      }
    });
  }

  /**
   * Sort the layers by title. asc or desc.
   * @internal
   */
  private sortCatalogItemsByTitle(items: CatalogItem[], direction) {
    const returnItem = items.sort((a, b) => {
      const titleA = a.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const titleB = b.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (titleA < titleB) {
        return -1;
      }
      if (titleA > titleB) {
        return 1;
      }
      return 0;
    });
    switch (direction) {
      case 'asc':
        return returnItem;
      case 'desc':
        return returnItem.reverse();
      default:
        return items;
    }
  }

  /**
   * Add all the layers of a group to map
   * @param group Catalog group
   */
  private addGroupToMap(
    group: CatalogItemGroup,
    event: AddedChangeGroupEmitter
  ) {
    let layers = group.items.filter((item: CatalogItem) => {
      const added = this.store().state.get(item).added || false;
      return this.isLayer(item) && added === false;
    });
    if (group.sortDirection !== undefined) {
      layers = this.sortCatalogItemsByTitle(layers, group.sortDirection);
    }
    this.addLayersToMap(layers.reverse() as CatalogItemLayer[], event);
  }

  /**
   * Remove all the layers of a group from map
   * @param group Catalog group
   */
  private removeGroupFromMap(group: CatalogItemGroup) {
    const layers = group.items.filter((item: CatalogItem) => {
      const added = this.store().state.get(item).added || false;
      return this.isLayer(item) && added === true;
    });
    this.removeLayersFromMap(layers as CatalogItemLayer[]);
  }
}
