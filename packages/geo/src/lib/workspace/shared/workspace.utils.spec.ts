import OlFeature from 'ol/Feature';

import { describe, expect, it } from 'vitest';

import { Feature } from '../../feature/shared/feature.interfaces';
import { getFeatureTableColumns } from './workspace.utils';

describe('getFeatureTableColumns', () => {
  it('collects columns from every feature', () => {
    const features: Feature[] = [
      {
        type: 'Feature',
        properties: {},
        ol: new OlFeature({
          firstAttribute: 'first',
          sharedAttribute: 'shared',
          _internal: 'hidden',
          boundedBy: 'hidden'
        })
      },
      {
        type: 'Feature',
        properties: {},
        ol: new OlFeature({
          sharedAttribute: 'shared',
          secondAttribute: 'second'
        })
      }
    ];

    const columns = getFeatureTableColumns(features);

    expect(columns.map((column) => column.name)).toEqual([
      'properties.firstAttribute',
      'properties.sharedAttribute',
      'properties.secondAttribute'
    ]);
  });
});
