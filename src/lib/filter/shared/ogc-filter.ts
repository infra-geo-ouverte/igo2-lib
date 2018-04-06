import {
  OgcFilter, IgoOgcFilterObject, WFSWriteGetFeatureOptions,
  AnyBaseOgcFilterOptions
} from './ogc-filter.interface';
import ol = require('openlayers');


export class OgcFilterWriter {


  public buildFilter(filters: IgoOgcFilterObject, extent: ol.Extent,
    proj: ol.proj.Projection, fieldNameGeometry: string): string {

    if (!filters) {
      return 'bbox=' + extent.join(',') + ',EPSG:3857';
    }

    const f = ol.format.filter;
    const bboxFilter = f.bbox(fieldNameGeometry, extent, proj.getCode());
    const filterAssembly: OgcFilter = f.and(bboxFilter, this.bundleFilter(filters));

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
    }

    if (filterObject.hasOwnProperty('logical')) {
      return this.createFilter({
        'operator': filterObject.logical,
        'logical_array': this.bundleFilter(filterObject.filters)
      });
    }

    if (filterObject.hasOwnProperty('operator')) {
      return this.createFilter(filterObject as AnyBaseOgcFilterOptions);
    }
  }


  private createFilter(filterOptions): OgcFilter {
    const operator = filterOptions.operator;
    const logical_array = filterOptions.logical_array;
    const f = ol.format.filter;

    const wfs_propertyName = filterOptions.propertyName;
    const wfs_pattern = filterOptions.pattern;
    const wfs_matchCase = filterOptions.matchCase ? filterOptions.matchCase : false;
    const wfs_wildCard = filterOptions.matchCase ? filterOptions.matchCase : '*';
    const wfs_singleChar = filterOptions.matchCase ? filterOptions.matchCase : '.';
    const wfs_escapeChar = filterOptions.matchCase ? filterOptions.matchCase : '!';

    const wfs_lowerBoundary = filterOptions.lowerBoundary;
    const wfs_upperBoundary = filterOptions.upperBoundary;

    const wfs_geometryName = filterOptions.geometryName;
    const wfs_extent = filterOptions.extent;
    const wfs_wkt_geometry = filterOptions.wkt_geometry;
    const wfs_srsName = filterOptions.srsName ? filterOptions.srsName : 'EPSG:3857';
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
        return f.between(wfs_propertyName, wfs_lowerBoundary, wfs_upperBoundary);
      case 'Contains': // do not work. Seems to have no exported members named contains...?
        return f.intersects(wfs_geometryName, geometry, 'EPSG:3857');
      case 'During':
        return f.during(wfs_propertyName, wfs_begin, wfs_end);
      case 'PropertyIsEqualTo':
        return f.equalTo(wfs_propertyName, wfs_pattern, wfs_matchCase);
      case 'PropertyIsGreaterThan':
        return f.greaterThan(wfs_propertyName, wfs_expression);
      case 'PropertyIsGreaterThanOrEqualTo':
        return f.greaterThanOrEqualTo(wfs_propertyName, wfs_expression);
      case 'Intersects':
        return f.intersects(wfs_geometryName, geometry, 'EPSG:3857');
      case 'PropertyIsNull':
        return f.isNull(wfs_propertyName);
      case 'PropertyIsLessThan':
        return f.lessThan(wfs_propertyName, wfs_expression);
      case 'PropertyIsLessThanOrEqualTo':
        return f.lessThanOrEqualTo(wfs_propertyName, wfs_expression);
      case 'PropertyIsLike':
        return f.like(wfs_propertyName, wfs_pattern, wfs_wildCard,
          wfs_singleChar, wfs_escapeChar, wfs_matchCase);
      case 'PropertyIsNotEqualTo':
        return f.notEqualTo(wfs_propertyName, wfs_pattern, wfs_matchCase);
      case 'Within':
        return f.within(wfs_geometryName, geometry, 'EPSG:3857');

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

}
