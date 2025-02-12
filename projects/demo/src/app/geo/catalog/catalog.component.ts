import { Component, OnInit } from '@angular/core';

import { EntityRecord, EntityStore } from '@igo2/common/entity';
import { PanelComponent } from '@igo2/common/panel';
import { StorageService } from '@igo2/core/storage';
import {
  AnyLayerOptions,
  Catalog,
  CatalogBrowserComponent,
  CatalogItem,
  CatalogLibaryComponent,
  CatalogService,
  IgoMap,
  LayerService,
  MAP_DIRECTIVES,
  MapService,
  MapViewOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
    selector: 'app-catalog',
    templateUrl: './catalog.component.html',
    styleUrls: ['./catalog.component.scss'],
    imports: [
        DocViewerComponent,
        ExampleViewerComponent,
        MAP_DIRECTIVES,
        PanelComponent,
        CatalogLibaryComponent,
        CatalogBrowserComponent
    ]
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
    const layers: AnyLayerOptions[] = [
      {
        title: 'OSM',
        sourceOptions: {
          type: 'osm'
        },
        baseLayer: true,
        visible: true
      }
    ];

    this.layerService
      .createLayers(layers)
      .subscribe((layers) => this.map.layerController.add(...layers));

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
