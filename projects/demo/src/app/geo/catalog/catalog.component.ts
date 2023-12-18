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
  MapService,
  MapViewOptions
} from '@igo2/geo';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class AppCatalogComponent implements OnInit {
  catalog: Catalog;
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 7
  };

  public catalogStore: EntityStore = new EntityStore<Catalog>([]);

  public catalogItemStore: EntityStore = new EntityStore<CatalogItem>([]);

  constructor(
    private layerService: LayerService,
    private catalogService: CatalogService,
    private storageService: StorageService,
    private mapService: MapService
  ) {}

  /**
   * @internal
   */
  ngOnInit(): void {
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
          const catalog: Catalog = record.entity;
          this.catalog = catalog;
        }
      });
  }

  /**
   * When the selected catalog changes, toggle the CatalogBrowser tool.
   * @internal
   * @param event Select event
   */
  onCatalogSelectChange(event: { selected: boolean; catalog: Catalog }): void {
    this.loadCatalogItems(event.catalog);
  }

  /**
   * Get all the available catalogs from the CatalogService and
   * load them into the store.
   */
  private loadCatalogs(): void {
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
  private loadCatalogItems(catalog: Catalog): void {
    this.catalogService
      .loadCatalogItems(catalog)
      .subscribe((items: CatalogItem[]) => {
        this.catalogItemStore.clear();
        this.catalogItemStore.load(items);
      });
  }
}
