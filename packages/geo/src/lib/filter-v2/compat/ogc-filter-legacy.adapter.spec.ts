import { describe, expect, it } from 'vitest';

import { OgcFiltersOptions } from '../../filter/shared/ogc-filter.interface';
import { fromLegacyOgcFiltersOptions } from './ogc-filter-legacy.adapter';

describe('fromLegacyOgcFiltersOptions', () => {
  it('maps a context ogcFilters block (advanced mode) unchanged', () => {
    const legacy: OgcFiltersOptions = {
      enabled: true,
      editable: true,
      filters: {
        operator: 'PropertyIsEqualTo',
        propertyName: 'num_route',
        expression: '00020'
      }
    };
    const config = fromLegacyOgcFiltersOptions(legacy, 'geometry');

    expect(config.enabled).toBe(true);
    expect(config.editable).toBe(true);
    expect(config.geometryName).toBe('geometry');
    expect(config.filters?.operator).toBe('PropertyIsEqualTo');
    expect(config.selectors).toBeUndefined();
  });

  it('unifies the five legacy selector properties under `selectors`', () => {
    const legacy: OgcFiltersOptions = {
      enabled: true,
      pushButtons: {
        selectorType: 'pushButton',
        groups: [{ name: 'g1', enabled: true, ids: ['b1'] }],
        bundles: [
          {
            id: 'b1',
            title: 'Routes',
            logical: 'Or',
            selectors: [
              {
                title: 'Route 20',
                enabled: true,
                filters: {
                  operator: 'PropertyIsEqualTo',
                  propertyName: 'num_route',
                  expression: '00020'
                }
              }
            ]
          },
          {
            id: 'excluded',
            selectors: []
          }
        ]
      }
    };
    const config = fromLegacyOgcFiltersOptions(legacy, 'geometry');

    expect(config.selectors).toHaveLength(1);
    const selector = config.selectors![0];
    expect(selector.id).toBe('b1');
    expect(selector.presentation).toBe('pushButton');
    expect(selector.logical).toBe('Or');
    expect(selector.items).toHaveLength(1);
    expect(selector.items[0].title).toBe('Route 20');
    expect(selector.items[0].enabled).toBe(true);
  });

  it('applies sane defaults when the legacy options are absent', () => {
    const config = fromLegacyOgcFiltersOptions(undefined, 'the_geom');
    expect(config.enabled).toBe(true);
    expect(config.editable).toBe(false);
    expect(config.geometryName).toBe('the_geom');
    expect(config.filters).toBeUndefined();
  });
});
