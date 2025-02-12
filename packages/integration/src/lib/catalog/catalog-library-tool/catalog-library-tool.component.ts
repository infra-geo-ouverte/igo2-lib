import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';

import { EntityStore } from '@igo2/common/entity';
import { ToolComponent } from '@igo2/common/tool';
import { StorageScope, StorageService } from '@igo2/core/storage';
import { Catalog, CatalogLibaryComponent, CatalogService } from '@igo2/geo';

import { take } from 'rxjs/operators';

import { ToolState } from '../../tool/tool.state';
import { CatalogState } from '../catalog.state';

/**
 * Tool to browse the list of available catalogs.
 */
@ToolComponent({
  name: 'catalog',
  title: 'igo.integration.tools.catalog',
  icon: 'library_add'
})
@Component({
  selector: 'igo-catalog-library-tool',
  templateUrl: './catalog-library-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CatalogLibaryComponent]
})
export class CatalogLibraryToolComponent implements OnInit {
  /**
   * Store that contains the catalogs
   * @internal
   */
  get store(): EntityStore<Catalog> {
    return this.catalogState.catalogStore;
  }

  /**
   * Determine if the form to add a catalog is allowed
   */
  @Input() addCatalogAllowed = false;

  /**
   * List of predefined catalogs
   */
  @Input() predefinedCatalogs: Catalog[] = [];

  set selectedCatalogId(id) {
    this.storageService.set('selectedCatalogId', id, StorageScope.SESSION);
  }

  get currentTool() {
    return this.toolState.toolbox.getCurrentPreviousToolName()[1];
  }

  get lastTool() {
    return this.toolState.toolbox.getCurrentPreviousToolName()[0];
  }

  constructor(
    private catalogService: CatalogService,
    private catalogState: CatalogState,
    private toolState: ToolState,
    private storageService: StorageService
  ) {}

  /**
   * @internal
   */
  ngOnInit() {
    if (this.lastTool === 'catalogBrowser' && this.currentTool === 'catalog') {
      this.selectedCatalogId = null;
    }

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
    this.catalogService
      .loadCatalogs()
      .pipe(take(1))
      .subscribe((catalogs: Catalog[]) => {
        this.store.clear();
        this.store.load(
          catalogs.concat(
            (this.storageService.get('addedCatalogs') || []) as Catalog[]
          )
        );
      });
  }
}
