import { Directive, Self, OnInit, OnDestroy,
         HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MapService } from '../../map';
import { LayerCatalog, GroupLayers, LayerService } from '../../layer';
import {
  AnyDataSourceContext,
  DataSourceService,
  CapabilitiesService
} from '../../datasource';

import { Catalog, CatalogService } from '../shared';
import { CatalogLayersListComponent } from './catalog-layers-list.component';


@Directive({
  selector: '[igoCatalogLayersListBinding]'
})
export class CatalogLayersListBindingDirective implements OnInit, OnDestroy {

  private component: CatalogLayersListComponent;
  private selectedCatalog$$: Subscription;

  @HostListener('select', ['$event']) onSelect(layer: LayerCatalog) {
    const map = this.mapService.getMap();
    const contextLayer: any = layer as any;

    const sourceContext = contextLayer.source;
    const layerContext = Object.assign({}, contextLayer);
    layerContext.visible = true;
    delete layerContext.source;

    const dataSourceContext = Object.assign({}, layerContext, sourceContext);

    this.dataSourceService
      .createAsyncDataSource(dataSourceContext as AnyDataSourceContext)
      .subscribe(dataSource =>  {
        const layerInstance = this.layerService.createLayer(dataSource, layerContext);
        map.addLayer(layerInstance);
      });
  }

  constructor(@Self() component: CatalogLayersListComponent,
              private catalogService: CatalogService,
              private mapService: MapService,
              private dataSourceService: DataSourceService,
              private layerService: LayerService,
              private capabilitiesService: CapabilitiesService) {
    this.component = component;
  }

  ngOnInit() {
    this.selectedCatalog$$ = this.catalogService.catalog$
      .subscribe((catalog) => this.handleCatalogChanged(catalog));
  }

  ngOnDestroy() {
    this.selectedCatalog$$.unsubscribe();
  }

  handleCatalogChanged(catalog: Catalog) {
    if (!catalog || !catalog.url) {
      return;
    }

    if (catalog.type === 'layers') {
      this.catalogService.getBaseLayers(catalog.url).subscribe((baselayers) => {
        this.component.groupsLayers = [{
          title: catalog.title,
          layers: baselayers,
          collapsed: false
        }];
      });
      return;
    }

    const groupsLayers: GroupLayers[] = [];
    this.capabilitiesService.getCapabilities('wms', catalog.url)
      .subscribe((capabilities) => {
        for (const group of capabilities.Capability.Layer.Layer) {
          groupsLayers.push({
            title: group.Title,
            layers: group.Layer.map((layer) => {
              return {
                title: layer.Title,
                type: 'wms',
                url: catalog.url,
                params: {
                  layers: layer.Name
                }
              };
            })
          });
        }

        this.component.groupsLayers = groupsLayers;
      });
  }

}
