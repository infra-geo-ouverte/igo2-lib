import { Pipe, PipeTransform } from '@angular/core';

import { Feature } from '../shared/feature.interface';

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

    const sourceFeatures = Object.keys(groupedFeatures).map(
      (source: string) => [source, groupedFeatures[source]]
    );

    return sourceFeatures;
  }
}
