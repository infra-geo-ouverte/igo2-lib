import { Injectable, inject } from '@angular/core';

import { AuthService } from '@igo2/auth';
import { EntityStore } from '@igo2/common/entity';
import { Catalog, CatalogItem } from '@igo2/geo';

/**
 * Service that holds the state of the catalog module
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogState {
  /**
   * Store that contains all the catalogs
   */
  get catalogStore(): EntityStore<Catalog> {
    return this._catalogStore;
  }
  private _catalogStore: EntityStore<Catalog>;

  /**
   * Catalog -> Catalog items store mapping
   */
  private catalogItemsStores = new Map<string, EntityStore<CatalogItem>>();

  constructor() {
    const authService = inject(AuthService);

    this._catalogStore = new EntityStore([]);

    authService.authenticate$.subscribe(() => {
      this.clearCatalogItemsStores();
    });
  }

  /**
   * Get a catalog's items store
   * @param catalog Catalog
   * @returns Store that contains the catalog items
   */
  getCatalogItemsStore(catalog: Catalog): EntityStore<CatalogItem> {
    return this.catalogItemsStores.get(catalog.id as string);
  }

  /**
   * Bind a catalog items store to a catalog
   * @param catalog Catalog
   * @param store Catalog items store
   */
  setCatalogItemsStore(catalog: Catalog, store: EntityStore<CatalogItem>) {
    this.catalogItemsStores.set(catalog.id as string, store);
  }

  /**
   * Clear all catalog items stores
   */
  clearCatalogItemsStores() {
    this.catalogItemsStores.clear();
  }
}
