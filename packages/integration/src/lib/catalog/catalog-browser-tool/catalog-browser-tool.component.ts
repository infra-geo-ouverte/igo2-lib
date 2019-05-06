import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { EntityRecord, EntityStore, ToolComponent } from '@igo2/common';

import {
  IgoMap,
  Catalog,
  CatalogItem,
  CatalogItemState,
  CatalogService
} from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { CatalogState } from '../catalog.state';

/**
 * Tool to browse a catalog's groups and layers and display them to a map.
 */
@ToolComponent({
  name: 'catalogBrowser',
  title: 'igo.integration.tools.catalog',
  icon: 'photo_browser'
})
@Component({
  selector: 'igo-catalog-browser-tool',
  templateUrl: './catalog-browser-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogBrowserToolComponent implements OnInit, OnDestroy {

  catalog: Catalog;

  /**
   * Store that contains the catalog items
   * @internal
   */
  store$ = new BehaviorSubject<EntityStore<CatalogItem, CatalogItemState>>(undefined);

  /**
   * Subscription to the selected catalog
   */
  private catalog$$: Subscription;

  /**
   * Map to add layers to
   * @internal
   */
  get map(): IgoMap {
    return this.mapState.map;
  }

  constructor(
    private catalogService: CatalogService,
    private catalogState: CatalogState,
    private mapState: MapState
  ) {}

  /**
   * @internal
   */
  ngOnInit() {
    const catalogStore = this.catalogState.catalogStore;
    this.catalog$$ = catalogStore.stateView
      .firstBy$(
        (record: EntityRecord<Catalog>) => record.state.selected === true
      )
      .subscribe((record: EntityRecord<Catalog>) => {
        if (record && record.entity) {
          const catalog = record.entity;
          this.catalog = catalog;
          this.loadCatalogItems(catalog);
        }
      });
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.catalog$$.unsubscribe();
  }

  /**
   * Get the selected catalog's items from the CatalogService and
   * load them into the store.
   * @param catalog Selected catalog
   */
  private loadCatalogItems(catalog: Catalog) {
    let store = this.catalogState.getCatalogItemsStore(catalog);
    if (store !== undefined) {
      this.store$.next(store);
      return;
    }

    store = new EntityStore<CatalogItem>([]);
    this.catalogState.setCatalogItemsStore(catalog, store);
    this.catalogService
      .loadCatalogItems(catalog)
      .subscribe((items: CatalogItem[]) => {
        store.load(items);
        this.store$.next(store);
      });
  }
}
