import { Pipe, PipeTransform } from '@angular/core';

import { TimeFilterableDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { AnyLayer, Layer, isLayerGroup } from '../../layer';
import { OgcFilterableDataSource } from './ogc-filter.interface';

@Pipe({
  name: 'filterableDataSource',
  standalone: true
})
export class FilterableDataSourcePipe implements PipeTransform {
  transform(value: AnyLayer[], arg: string): Layer[] {
    let layers: Layer[];
    if (arg === 'time') {
      layers = value.filter((layer) => {
        if (isLayerGroup(layer)) {
          return false;
        }
        const datasource = layer.dataSource as TimeFilterableDataSource;
        return (
          this.isTimeFilterable(datasource) &&
          datasource.options.timeFilter !== undefined &&
          Object.keys(datasource.options.timeFilter).length
        );
      }) as Layer[];
    }
    if (arg === 'ogc') {
      layers = value.filter((layer) => {
        if (isLayerGroup(layer)) {
          return false;
        }
        const datasource = layer.dataSource as OgcFilterableDataSource;
        return this.isOgcFilterable(datasource);
      }) as Layer[];
    }
    return layers;
  }

  private isTimeFilterable(dataSource: TimeFilterableDataSource) {
    if (dataSource.options.type !== 'wms') {
      return false;
    }
    return dataSource.options.timeFilterable;
  }

  private isOgcFilterable(dataSource: OgcFilterableDataSource): boolean {
    let isOgcFilterable = false;
    if (
      dataSource.options.ogcFilters &&
      dataSource.options.ogcFilters.enabled &&
      dataSource.options.ogcFilters.editable
    ) {
      isOgcFilterable = true;
    }
    if (
      dataSource.options.ogcFilters &&
      dataSource.options.ogcFilters.enabled &&
      (dataSource.options.ogcFilters.pushButtons ||
        dataSource.options.ogcFilters.checkboxes ||
        dataSource.options.ogcFilters.radioButtons ||
        dataSource.options.ogcFilters.select ||
        dataSource.options.ogcFilters.autocomplete)
    ) {
      isOgcFilterable = true;
    }
    return isOgcFilterable;
  }
}
