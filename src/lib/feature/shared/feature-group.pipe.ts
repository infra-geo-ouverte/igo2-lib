import { Pipe, PipeTransform } from '@angular/core';

import { Feature } from '../shared';

@Pipe({
  name: 'featureGroup'
})
export class FeatureGroupPipe implements PipeTransform {

  transform(value: Feature[], args?: any): any {
    const groupedFeatures = {};

    value.forEach((feature: Feature) => {
      const source = feature.source;
      if (groupedFeatures[source] === undefined) {
        groupedFeatures[source] = [];
      }

      groupedFeatures[source].push(feature);
    });

    const sourceFeatures = Object.keys(groupedFeatures).sort((a, b) => {
      return groupedFeatures[a][0].order - groupedFeatures[b][0].order;
    }).map(
      (source: string) => [source, groupedFeatures[source]]
    );

    return sourceFeatures;
  }

}
