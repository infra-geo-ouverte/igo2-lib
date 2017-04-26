import { Pipe, PipeTransform } from '@angular/core';

import { Layer, FilterableLayer } from '../../layer';

@Pipe({
  name: 'filterableLayer'
})
export class FilterableLayerPipe implements PipeTransform {

  transform(value: Layer[], arg: string): any {
    let layers;

    if (arg === 'time') {
      layers = value.filter(layer => {
        return layer.isFilterable() && layer.options.timeFilter !== undefined;
      }) as any[] as FilterableLayer[];
    }

    return layers;
  }

}
