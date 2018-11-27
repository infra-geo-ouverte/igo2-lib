import {
  Directive,
  Self,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import { Subscription } from 'rxjs';

import { MapService } from '../../map/shared/map.service';
import { LayerService } from '../../layer/shared/layer.service';
import {
  LayerOptions,
  GroupLayers
} from '../../layer/shared/layers/layer.interface';
import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import { AnyDataSourceOptions } from '../../datasource/shared/datasources/any-datasource.interface';
import { DataSourceService } from '../../datasource/shared/datasource.service';

import { CatalogService } from '../shared/catalog.service';
import { Catalog } from '../shared/catalog.interface';
import { CatalogLayersListComponent } from './catalog-layers-list.component';

@Directive({
  selector: '[igoCatalogLayersListBinding]'
})
export class CatalogLayersListBindingDirective implements OnInit, OnDestroy {
  private component: CatalogLayersListComponent;
  private selectedCatalog$$: Subscription;

  @HostListener('select', ['$event'])
  onSelect(layer: LayerOptions) {
    const map = this.mapService.getMap();
    layer.visible = true;
    this.layerService.createAsyncLayer(layer).subscribe(layerCreated => {
      map.addLayer(layerCreated);
    });
  }

  constructor(
    @Self() component: CatalogLayersListComponent,
    private catalogService: CatalogService,
    private mapService: MapService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private capabilitiesService: CapabilitiesService
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.selectedCatalog$$ = this.catalogService.catalog$.subscribe(catalog =>
      this.handleCatalogChanged(catalog)
    );
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
    let timeFilter;
    // Dig all levels until last level (layer object are not defined on last level)
    for (const group of layerList.Layer) {
      if (typeof group.Layer !== 'undefined') {
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
              timeFilter = this.capabilitiesService.getTimeFilter(layer);
              const metadata = layer.DataURL ? layer.DataURL[0] : undefined;
              const abstract = layer.Abstract ? layer.Abstract : undefined;
              const keywordList = layer.KeywordList ? layer.KeywordList : undefined;
              const timeFilterable = timeFilter && Object.keys(timeFilter).length > 0 ? true : false;
              arrLayer.push({
                title: layer.Title,
                metadata: {
                  url: metadata ? metadata.OnlineResource : undefined,
                  extern: metadata ? true : undefined,
                  abstract: abstract,
                  keywordList: keywordList
                },
                sourceOptions: {
                  type: 'wms',
                  url: catalog.url,
                  params: {
                    layers: layer.Name
                  },
                  // Merge catalog time filter in layer timeFilter
                  timeFilter: { ...timeFilter, ...catalog.timeFilter },
                  timeFilterable: timeFilterable ? true : false
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
      this.catalogService.getBaseLayers(catalog.url).subscribe(baselayers => {
        this.component.groupsLayers = [
          {
            title: catalog.title,
            layers: baselayers,
            collapsed: false
          }
        ];
      });
      return;
    }

    const groupsLayers: GroupLayers[] = [];
    this.capabilitiesService
      .getCapabilities('wms', catalog.url)
      .subscribe(capabilities => {
        this.includeRecursiveLayer(
          catalog,
          capabilities.Capability.Layer,
          groupsLayers
        );
        this.component.groupsLayers = groupsLayers;
      });
  }
}
