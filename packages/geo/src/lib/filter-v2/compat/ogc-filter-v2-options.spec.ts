import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { WFSDataSource } from '../../datasource/shared/datasources/wfs-datasource';
import { WFSDataSourceOptions } from '../../datasource/shared/datasources/wfs-datasource.interface';
import { WFSService } from '../../datasource/shared/datasources/wfs.service';
import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { WMSDataSourceOptions } from '../../datasource/shared/datasources/wms-datasource.interface';
import {
  OgcFilterEqualToOptions,
  OgcFilterableDataSourceOptions
} from '../../filter/shared/ogc-filter.interface';
import { OGCFilterService } from '../../filter/shared/ogc-filter.service';
import { OgcFilterFacade } from '../application';
import {
  createWfsOgcFilterTarget,
  createWmsOgcFilterTarget
} from './ogc-filter-datasource.adapter';
import {
  OgcFilterableV2DataSourceOptions,
  normalizeOgcFilterConfig
} from './ogc-filter-v2-options';

describe('normalizeOgcFilterConfig', () => {
  it('applies defaults on a partial JSON configuration', () => {
    const config = normalizeOgcFilterConfig({
      filters: {
        operator: 'PropertyIsEqualTo',
        propertyName: 'num_route',
        expression: '00020'
      }
    });
    expect(config.enabled).toBe(true);
    expect(config.editable).toBe(false);
    expect(config.geometryName).toBe('geometry');
    expect(config.filters?.operator).toBe('PropertyIsEqualTo');
  });
});

describe('ogcFiltersV2 (store connected to datasource targets)', () => {
  let facade: OgcFilterFacade;

  beforeEach(() => {
    facade = TestBed.inject(OgcFilterFacade);
  });

  it('applies the JSON-configured filter to a WMS datasource', () => {
    const options: WMSDataSourceOptions & OgcFilterableV2DataSourceOptions = {
      type: 'wms',
      url: 'https://example.com/wms',
      params: { LAYERS: 'layer_a,layer_b' },
      ogcFiltersV2: {
        filters: {
          operator: 'PropertyIsEqualTo',
          propertyName: 'num_route',
          expression: '00020'
        }
      }
    };
    const dataSource = new WMSDataSource(options);

    const store = facade.createStore(
      normalizeOgcFilterConfig(options.ogcFiltersV2!)
    );
    facade.connect(store, createWmsOgcFilterTarget(dataSource), dataSource);
    TestBed.tick();

    const filter = dataSource.ol.getParams().FILTER as string;
    expect(filter.startsWith('(<Filter')).toBe(true);
    // One parenthesized filter per requested layer.
    expect(filter.match(/\(<Filter/g)).toHaveLength(2);
    expect(facade.getStore(dataSource)).toBe(store);

    store.enabled.set(false);
    TestBed.tick();
    expect(dataSource.ol.getParams().FILTER).toBeUndefined();
  });

  it('bridges the JSON-configured filter to a WFS datasource', () => {
    const options: WFSDataSourceOptions & OgcFilterableV2DataSourceOptions = {
      type: 'wfs',
      url: 'https://example.com/wfs',
      params: {
        version: '2.0.0',
        featureTypes: 'test',
        fieldNameGeometry: 'geometry',
        outputFormat: 'GeoJSON',
        srsName: 'EPSG:3857'
      },
      ogcFiltersV2: {
        filters: {
          operator: 'PropertyIsEqualTo',
          propertyName: 'num_route',
          expression: '00020'
        }
      }
    };
    const dataSource = new WFSDataSource(
      options,
      {} as WFSService,
      new OGCFilterService()
    );

    const store = facade.createStore(
      normalizeOgcFilterConfig(options.ogcFiltersV2!)
    );
    facade.connect(store, createWfsOgcFilterTarget(dataSource), dataSource);
    TestBed.tick();

    const legacy = (dataSource.options as OgcFilterableDataSourceOptions)
      .ogcFilters;
    expect(legacy?.enabled).toBe(true);
    expect(legacy?.advancedOgcFilters).toBe(true);
    expect((legacy?.filters as OgcFilterEqualToOptions)?.propertyName).toBe(
      'num_route'
    );
    expect(facade.getStore(dataSource)).toBe(store);
  });
});
