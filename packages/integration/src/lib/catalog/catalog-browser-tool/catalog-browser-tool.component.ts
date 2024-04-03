import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import { AuthService } from '@igo2/auth';
import { EntityRecord, EntityStore, ToolComponent } from '@igo2/common';
import {
  Catalog,
  CatalogBrowserComponent,
  CatalogItem,
  CatalogItemState,
  CatalogService,
  IgoMap
} from '@igo2/geo';

import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

import { MapState } from '../../map/map.state';
import { CatalogState } from '../catalog.state';

/**
 * Tool to browse a catalog's groups and layers and display them to a map.
 */
@ToolComponent({
  name: 'catalogBrowser',
  title: 'igo.integration.tools.catalog',
  parent: 'catalog'
})
@Component({
  selector: 'igo-catalog-browser-tool',
  templateUrl: './catalog-browser-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, CatalogBrowserComponent, AsyncPipe]
})
export class CatalogBrowserToolComponent implements OnInit, OnDestroy {
  catalog: Catalog;

  /**
   * Store that contains the catalog items
   * @internal
   */
  store$ = new BehaviorSubject<EntityStore<CatalogItem, CatalogItemState>>(
    undefined
  );

  /**
   * Subscription to the selected catalog
   */
  private catalog$$: Subscription;

  /**
   * Whether a group can be toggled when it's collapsed
   */
  @Input() toggleCollapsedGroup: boolean = true;

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
    private mapState: MapState,
    private authService: AuthService
  ) {}

  /**
   * @internal
   */
  ngOnInit() {
    const catalogStore = this.catalogState.catalogStore;

    const catalog$ = catalogStore.stateView.firstBy$(
      (record: EntityRecord<Catalog>) => record.state.selected === true
    );
    const authenticate$ = this.authService.authenticate$;
    this.catalog$$ = combineLatest([catalog$, authenticate$]).subscribe(
      ([record, authenticate]) => {
        const catalog = record.entity;
        this.catalog = catalog;
        this.loadCatalogItems(this.catalog);
      }
    );
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
      .pipe(take(1))
      .subscribe((items: CatalogItem[]) => {
        store.load(items);
        this.store$.next(store);
      });
  }
}
