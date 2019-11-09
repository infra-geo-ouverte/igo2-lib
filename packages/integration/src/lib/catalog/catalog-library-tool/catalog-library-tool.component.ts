import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { ToolComponent } from '@igo2/common';

import { EntityStore } from '@igo2/common';
import { Catalog, CatalogService } from '@igo2/geo';

import { ToolState } from '../../tool/tool.state';
import { CatalogState } from '../catalog.state';

/**
 * Tool to browse the list of available catalogs.
 */
@ToolComponent({
  name: 'catalog',
  title: 'igo.integration.tools.catalog',
  icon: 'layers-plus'
})
@Component({
  selector: 'igo-catalog-library-tool',
  templateUrl: './catalog-library-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLibraryToolComponent implements OnInit {
  /**
   * Store that contains the catalogs
   * @internal
   */
  get store(): EntityStore<Catalog> {
    return this.catalogState.catalogStore;
  }

  constructor(
    private catalogService: CatalogService,
    private catalogState: CatalogState,
    private toolState: ToolState
  ) {}

  /**
   * @internal
   */
  ngOnInit() {
    if (this.store.count === 0) {
      this.loadCatalogs();
    }
  }

  /**
   * When the selected catalog changes, toggle the the CatalogBrowser tool.
   * @internal
   * @param event Select event
   */
  onCatalogSelectChange(event: { selected: boolean; catalog: Catalog }) {
    if (event.selected === false) {
      return;
    }
    this.toolState.toolbox.activateTool('catalogBrowser');
  }

  /**
   * Get all the available catalogs from the CatalogService and
   * load them into the store.
   */
  private loadCatalogs() {
    this.catalogService.loadCatalogs().subscribe((catalogs: Catalog[]) => {
      this.store.clear();
      this.store.load(catalogs);
    });
  }
}
