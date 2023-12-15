import { Component, OnInit } from '@angular/core';

import { EntityRecord, EntityStore } from '@igo2/common';
import { StorageService } from '@igo2/core';
import {
  Catalog,
  CatalogItem,
  CatalogService,
  IgoMap,
  ImageLayer,
  LayerOptions,
  LayerService,
  MapService
} from '@igo2/geo';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class AppCatalogComponent implements OnInit {
  catalog: Catalog;
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 7
  };

  public catalogStore = new EntityStore<Catalog>([]);

  public catalogItemStore = new EntityStore<CatalogItem>([]);

  constructor(
    private layerService: LayerService,
    private catalogService: CatalogService,
    private storageService: StorageService,
    private mapService: MapService
  ) {}

  /**
   * @internal
   */
  ngOnInit() {
    this.layerService
      .createAsyncLayer({
        title: 'OSM',
        baseLayer: true,
        visible: true,
        sourceOptions: {
          type: 'osm'
        }
      } as LayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));

    this.loadCatalogs();

    this.mapService.setMap(this.map);
    this.catalogStore.stateView
      .firstBy$(
        (record: EntityRecord<Catalog>) => record.state.selected === true
      )
      .subscribe((record: EntityRecord<Catalog>) => {
        if (record && record.entity) {
          const catalog = record.entity;
          this.catalog = catalog;
        }
      });
  }

  /**
   * When the selected catalog changes, toggle the the CatalogBrowser tool.
   * @internal
   * @param event Select event
   */
  onCatalogSelectChange(event: { selected: boolean; catalog: Catalog }) {
    this.loadCatalogItems(event.catalog);
  }

  /**
   * Get all the available catalogs from the CatalogService and
   * load them into the store.
   */
  private loadCatalogs() {
    this.catalogService.loadCatalogs().subscribe((catalogs: Catalog[]) => {
      this.catalogStore.clear();
      this.catalogStore.load(
        catalogs.concat(
          (this.storageService.get('addedCatalogs') || []) as Catalog[]
        )
      );
    });
  }

  /**
   * Get the selected catalog's items from the CatalogService and
   * load them into the store.
   * @param catalog Selected catalog
   */
  private loadCatalogItems(catalog: Catalog) {
    this.catalogService
      .loadCatalogItems(catalog)
      .subscribe((items: CatalogItem[]) => {
        this.catalogItemStore.clear();
        this.catalogItemStore.load(items);
      });
  }
}
