import {
  Directive, Self, OnInit, OnDestroy,
  HostListener
} from '@angular/core';
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
      .subscribe(dataSource => {
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

  /**
   * Dig in the layerList for each layer definition
   @param catalog: object of config.json parameter
   @param layerList: object of current level of layers
   @param groupsLayers: object of group of layers to show in the app
  */
  includeRecursiveLayer(catalog, layerList, groupsLayers) {
    let currentRegFilter;
    let boolRegFilter = true;
    let objGroupLayers;
    // Dig all levels until last level (layer object are not defined on last level)
    for (const group of layerList.Layer) {
      if (group.queryable === false && typeof group.Layer !== 'undefined') {
        // recursive, check next level
        this.includeRecursiveLayer(catalog, group, groupsLayers);
      } else {
        // Define object of group layer
        objGroupLayers = {
          title: layerList.Title,
          // Add only layers with regFilter condition respected
          layers: layerList.Layer.reduce((arrLayer, layer) => {
            boolRegFilter = true;
            // Check for regex validation on layer's name
            if (typeof catalog.regFilters !== 'undefined') {
              // Test layer.Name for each regex define in config.json
              for (const regFilter of catalog.regFilters) {
                boolRegFilter = false;
                currentRegFilter = new RegExp(regFilter);
                boolRegFilter = currentRegFilter.test(layer.Name);
                // If regex is respected, stop the for loop
                if (boolRegFilter === true) {
                  break;
                }
              }
            }
            // If layer regex is okay (or not define), add the layer to the group
            if (boolRegFilter === true) {
              arrLayer.push({
                title: layer.Title,
                type: 'wms',
                url: catalog.url,
                params: {
                  layers: layer.Name
                }
              });
            }
            return arrLayer;
          }, [])
        };
        /* If object contain layers (when regFilters is define, the condition
        in Layer.map can define group with no layer) */
        if (objGroupLayers.layers.length !== 0) {
          groupsLayers.push(objGroupLayers);
        }
        // Break the group (don't add a group of layer for each of their layer!)
        break;
      }
    }
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
        this.includeRecursiveLayer(catalog, capabilities.Capability.Layer, groupsLayers);
        this.component.groupsLayers = groupsLayers;
      });
  }
}
