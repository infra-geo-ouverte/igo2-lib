import * as ol from 'openlayers';

import { uuid } from '@igo2/utils';

import {
  OgcFilter,
  IgoOgcFilterObject,
  WFSWriteGetFeatureOptions,
  AnyBaseOgcFilterOptions,
  OgcInterfaceFilterOptions
} from './ogc-filter.interface';

export class OgcFilterWriter {
  private filterSequence: OgcInterfaceFilterOptions[] = [];
  public operators = {
    PropertyIsEqualTo: { fieldRestrict: [] },
    PropertyIsNotEqualTo: { fieldRestrict: [] },
    PropertyIsLike: { fieldRestrict: ['string'] },
    PropertyIsGreaterThan: { fieldRestrict: ['number'] },
    PropertyIsGreaterThanOrEqualTo: { fieldRestrict: ['number'] },
    PropertyIsLessThan: { fieldRestrict: ['number'] },
    PropertyIsLessThanOrEqualTo: { fieldRestrict: ['number'] },
    PropertyIsBetween: { fieldRestrict: ['number'] },
    During: { fieldRestrict: [] },
    PropertyIsNull: { fieldRestrict: [] },
    Intersects: { fieldRestrict: [] },
    Within: { fieldRestrict: [] },
    Contains: { fieldRestrict: [] }
  };

  public buildFilter(
    filters: IgoOgcFilterObject,
    extent?: ol.Extent,
    proj?,
    fieldNameGeometry?: string
  ): string {
    const f = ol.format.filter;
    let bboxFilter;
    let enableBbox: boolean;
    if (/intersects|contains|within/gi.test(JSON.stringify(filters))) {
      enableBbox = false;
    } else {
      enableBbox = true;
    }
    if (filters) {
      fieldNameGeometry =
        filters['geometryName'] !== undefined
          ? filters['geometryName']
          : fieldNameGeometry;
    }
    if (extent && filters) {
      bboxFilter = f.bbox(fieldNameGeometry, extent, proj.getCode());
    }
    let filterAssembly: OgcFilter;
    if (filters) {
      filters = this.checkIgoFiltersProperties(filters, fieldNameGeometry);
      if (extent && enableBbox) {
        filterAssembly = f.and(bboxFilter, this.bundleFilter(filters));
      } else {
        filterAssembly = this.bundleFilter(filters);
      }
    } else {
      return 'bbox=' + extent.join(',') + ',EPSG:3857';
    }

    const wfsOptions: WFSWriteGetFeatureOptions = {
      srsName: '',
      featureNS: '',
      featurePrefix: '',
      featureTypes: ['featureTypes'],
      filter: filterAssembly,
      outputFormat: '',
      geometryName: fieldNameGeometry
    };

    const query = new ol.format.WFS().writeGetFeature(wfsOptions);
    const str = new XMLSerializer().serializeToString(query);
    const regexp1 = /typenames *=|typename *=\"featureTypes\" *>/gi;
    const regexp2 = /<\/Query><\/GetFeature>/gi;

    return 'filter=' + str.split(regexp1)[1].split(regexp2)[0];
  }

  private bundleFilter(filterObject: any) {
    if (filterObject instanceof Array) {
      const logical_array = [];
      filterObject.forEach(element => {
        logical_array.push(this.bundleFilter(element));
      });
      return logical_array;
    } else {
      if (filterObject.hasOwnProperty('logical')) {
        return this.createFilter({
          operator: filterObject.logical,
          logical_array: this.bundleFilter(filterObject.filters)
        });
      } else if (filterObject.hasOwnProperty('operator')) {
        return this.createFilter(filterObject as AnyBaseOgcFilterOptions);
      }
    }
  }

  private createFilter(filterOptions): OgcFilter {
    const operator = filterOptions.operator;
    const logical_array = filterOptions.logical_array;
    const f = ol.format.filter;

    const wfs_propertyName = filterOptions.propertyName;
    const wfs_pattern = filterOptions.pattern;
    const wfs_matchCase = filterOptions.matchCase
      ? filterOptions.matchCase
      : false;
    const wfs_wildCard = filterOptions.wildCard ? filterOptions.wildCard : '*';
    const wfs_singleChar = filterOptions.singleChar
      ? filterOptions.singleChar
      : '.';
    const wfs_escapeChar = filterOptions.escapeChar
      ? filterOptions.escapeChar
      : '!';

    const wfs_lowerBoundary = filterOptions.lowerBoundary;
    const wfs_upperBoundary = filterOptions.upperBoundary;

    const wfs_geometryName = filterOptions.geometryName;
    const wfs_extent = filterOptions.extent;
    const wfs_wkt_geometry = filterOptions.wkt_geometry;
    const wfs_srsName = filterOptions.srsName
      ? filterOptions.srsName
      : 'EPSG:3857';

    const wfs_begin = filterOptions.begin;
    const wfs_end = filterOptions.end;

    const wfs_expression = filterOptions.expression;

    let geometry: ol.geom.Geometry;
    if (wfs_wkt_geometry) {
      const wkt = new ol.format.WKT();
      geometry = wkt.readGeometry(wfs_wkt_geometry, {
        dataProjection: wfs_srsName,
        featureProjection: 'EPSG:3857'
      });
    }

    switch (operator) {
      case 'BBOX':
        return f.bbox(wfs_geometryName, wfs_extent, wfs_srsName);
      case 'PropertyIsBetween':
        return f.between(
          wfs_propertyName,
          wfs_lowerBoundary,
          wfs_upperBoundary
        );
      case 'Contains':
        return (f as any).contains(wfs_geometryName, geometry, wfs_srsName);
      case 'During':
        return f.during(wfs_propertyName, wfs_begin, wfs_end);
      case 'PropertyIsEqualTo':
        return f.equalTo(wfs_propertyName, wfs_expression, wfs_matchCase);
      case 'PropertyIsGreaterThan':
        return f.greaterThan(wfs_propertyName, wfs_expression);
      case 'PropertyIsGreaterThanOrEqualTo':
        return f.greaterThanOrEqualTo(wfs_propertyName, wfs_expression);
      case 'Intersects':
        return f.intersects(wfs_geometryName, geometry, wfs_srsName);
      case 'PropertyIsNull':
        return f.isNull(wfs_propertyName);
      case 'PropertyIsLessThan':
        return f.lessThan(wfs_propertyName, wfs_expression);
      case 'PropertyIsLessThanOrEqualTo':
        return f.lessThanOrEqualTo(wfs_propertyName, wfs_expression);
      case 'PropertyIsLike':
        return f.like(
          wfs_propertyName,
          wfs_pattern.replace(/[()_]/gi, wfs_singleChar),
          wfs_wildCard,
          wfs_singleChar,
          wfs_escapeChar,
          wfs_matchCase
        );
      case 'PropertyIsNotEqualTo':
        return f.notEqualTo(wfs_propertyName, wfs_expression, wfs_matchCase);
      case 'Within':
        return f.within(wfs_geometryName, geometry, wfs_srsName);
      // LOGICAL
      case 'And':
        return f.and.apply(null, logical_array);
      case 'Or':
        return f.or.apply(null, logical_array);
      case 'Not':
        return f.not.apply(null, logical_array);

      default:
        return undefined;
    }
  }

  public defineInterfaceFilterSequence(
    filterObject: any,
    geometryName,
    logical = '',
    level = -1
  ): OgcInterfaceFilterOptions[] {
    if (filterObject instanceof Array) {
      filterObject.forEach(element => {
        this.filterSequence.concat(
          this.defineInterfaceFilterSequence(
            element,
            geometryName,
            logical,
            level
          )
        );
      });
    } else {
      if (filterObject.hasOwnProperty('logical')) {
        level = level + 1;
        this.filterSequence.concat(
          this.defineInterfaceFilterSequence(
            filterObject['filters'],
            geometryName,
            filterObject['logical'],
            level
          )
        );
      } else if (filterObject.hasOwnProperty('operator')) {
        this.filterSequence.push(
          this.addInterfaceFilter(filterObject, geometryName, level, logical)
        );
      }
    }
    return this.filterSequence;
  }

  public addInterfaceFilter(
    igoOgcFilterObject = { operator: 'PropertyIsEqualTo' },
    geometryName?,
    level = 0,
    parentLogical = 'Or'
  ): OgcInterfaceFilterOptions {
    const f = {
      propertyName: '',
      operator: '',
      active: '',
      filterid: uuid(),
      begin: '',
      end: '',
      lowerBoundary: '',
      upperBoundary: '',
      expression: '',
      pattern: '',
      wildCard: '*',
      singleChar: '.',
      escapeChar: '!',
      matchCase: false,
      igoSpatialSelector: '',
      geometryName: '',
      geometry: '',
      extent: '',
      srsName: '',
      parentLogical: '',
      level: 0
    };

    return Object.assign(
      f,
      {
        parentLogical: parentLogical,
        level: level,
        geometryName: geometryName
      },
      igoOgcFilterObject
    );
  }

  public checkIgoFiltersProperties(
    filterObject: any,
    fieldNameGeometry,
    active = false
  ) {
    const filter_array = [];
    if (filterObject instanceof Array) {
      filterObject.forEach(element => {
        filter_array.push(
          this.checkIgoFiltersProperties(element, fieldNameGeometry, active)
        );
      });
      return filter_array;
    } else {
      if (filterObject.hasOwnProperty('logical')) {
        return Object.assign(
          {},
          {
            logical: filterObject['logical'],
            filters: this.checkIgoFiltersProperties(
              filterObject['filters'],
              fieldNameGeometry,
              active
            )
          }
        );
      } else if (filterObject.hasOwnProperty('operator')) {
        return this.addFilterProperties(
          filterObject as AnyBaseOgcFilterOptions,
          fieldNameGeometry,
          active
        );
      }
    }
  }

  private addFilterProperties(
    igoOgcFilterObject: AnyBaseOgcFilterOptions,
    fieldNameGeometry,
    active = false
  ) {
    const filterid = igoOgcFilterObject.hasOwnProperty('filterid')
      ? igoOgcFilterObject['filterid']
      : uuid();
    const status = igoOgcFilterObject.hasOwnProperty('active')
      ? igoOgcFilterObject['active']
      : active;

    return Object.assign(
      {},
      {
        filterid: filterid,
        active: status,
        igoSpatialSelector: 'fixedExtent'
      },
      igoOgcFilterObject,
      { geometryName: fieldNameGeometry }
    );
  }

  public rebuiltIgoOgcFilterObjectFromSequence(
    sequence: OgcInterfaceFilterOptions[]
  ): IgoOgcFilterObject {
    if (sequence instanceof Array) {
      if (sequence.length >= 1) {
        let lastParentLogical = sequence[0]['parentLogical'];
        let nextElement: any;
        let logicalArray = [];
        let lastProcessedFilter;
        sequence.forEach(uiFilter => {
          const element = Object.assign({}, uiFilter);
          const index = sequence.indexOf(uiFilter);
          if (index >= 0 && index < sequence.length - 1) {
            nextElement = sequence[index + 1];
          } else {
            nextElement = element;
          }
          delete element['active'];
          delete element['filterid'];
          delete element['parentLogical'];
          logicalArray.push(element);

          if (sequence.length === 1) {
            lastProcessedFilter = element;
          } else if (lastParentLogical !== nextElement['parentLogical']) {
            if (logicalArray.length === 1) {
              console.log(
                'You must set at ' +
                  'least two operator in a logical (' +
                  lastParentLogical +
                  ')'
              );
            } else {
              lastProcessedFilter = Object.assign(
                {},
                { logical: lastParentLogical, filters: logicalArray }
              );
              logicalArray = [lastProcessedFilter];
              lastParentLogical = nextElement['parentLogical'];
            }
          }
        });
        return lastProcessedFilter;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
}
