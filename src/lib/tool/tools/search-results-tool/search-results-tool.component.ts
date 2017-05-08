import { Component } from '@angular/core';

import { Feature, FeatureType } from '../../../feature';
import { OverlayService } from '../../../overlay';
import { AnyDataSourceOptions, DataSourceService } from '../../../datasource';
import { LayerService } from '../../../layer';
import { MapService } from '../../../map';

import { Register } from '../../shared';


@Register({
  name: 'searchResults',
  title: 'igo.searchResults',
  icon: 'search'
})
@Component({
  selector: 'igo-search-results-tool',
  templateUrl: './search-results-tool.component.html',
  styleUrls: ['./search-results-tool.component.styl']
})
export class SearchResultsToolComponent {

  constructor(private overlayService: OverlayService,
              private mapService: MapService,
              private layerService: LayerService,
              private dataSourceService: DataSourceService) { }

  handleFeatureFocus(feature: Feature) {
    if (feature.type === FeatureType.Feature) {
      this.overlayService.setFeatures([feature], 'move');
    }
  }

  handleFeatureSelect(feature: Feature) {
    if (feature.type === FeatureType.Feature) {
      this.overlayService.setFeatures([feature], 'zoom');
    } else if (feature.type === FeatureType.DataSource) {
      const map = this.mapService.getMap();

      if (map !== undefined) {
        this.dataSourceService
          .createAsyncDataSource(feature.properties as AnyDataSourceOptions)
          .subscribe(dataSource =>  {
            map.addLayer(
              this.layerService.createLayer(dataSource, feature.properties));
          });
      }
    }
  }

}
