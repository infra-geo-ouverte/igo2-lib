import {
  Component,
  Input,
  OnInit
} from '@angular/core';

import {
  OgcInterfaceFilterOptions,
  OgcFilterableDataSource,
  OgcFiltersOptions
} from '../../filter/shared/ogc-filter.interface';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import { WktService } from '../../wkt/shared/wkt.service';
import { IgoMap } from '../../map';
import { OgcFilterOperatorType } from '../../filter/shared/ogc-filter.enum';
import { FloatLabelType } from '@angular/material';

@Component({
  selector: 'igo-ogc-filter-form',
  templateUrl: './ogc-filter-form.component.html',
  styleUrls: ['./ogc-filter-form.component.scss']
})
export class OgcFilterFormComponent implements OnInit {
  public ogcFilterOperators;
  public igoSpatialSelectors;
  public value = '';
  public inputOperator;
  public fields: any[];
  public values: any[];
  public color = 'primary';
  public snrc = '';
  public disabled;
  public baseOverlayName = 'ogcFilterOverlay_';

  @Input() refreshFilters: () => void;

  @Input() datasource: OgcFilterableDataSource;

  @Input() map: IgoMap;

  @Input() currentFilter: any;

  @Input() floatLabel: FloatLabelType = 'never';

  get activeFilters() {
    this.updateField();
    return this.datasource.options.ogcFilters.interfaceOgcFilters.filter(
      f => f.active === true
    );
  }

  constructor(
    private wktService: WktService
  ) {
    // TODO: Filter permitted operator based on wfscapabilities
    // Need to work on regex on XML capabilities because
    // comaparison operator's name varies between WFS servers...
    // Ex: IsNull vs PropertyIsNull vs IsNil ...
    this.ogcFilterOperators = new OgcFilterWriter().operators;
    this.igoSpatialSelectors = [
      {
        type: 'fixedExtent'
      },
      {
        type: 'snrc'
      }
    ];
    // TODO: selectFeature & drawFeature
  }

  ngOnInit() {
    this.computeAllowedOperators();
  }

  computeAllowedOperators() {
    let allowedOperators = this.datasource.options.ogcFilters.allowedOperatorsType;
    let effectiveOperators: {} = {};

    if (!allowedOperators)  {
      allowedOperators = OgcFilterOperatorType.BasicAndSpatial;
    }

    switch (allowedOperators.toLowerCase()) {
      case 'all':
        effectiveOperators = this.ogcFilterOperators;
        break;
      case 'spatial':
        effectiveOperators = {
          Intersects: { spatial: true, fieldRestrict: [] },
          Within: { spatial: true, fieldRestrict: [] },
        };
        break;
      case 'basicandspatial':
        effectiveOperators = {
          PropertyIsEqualTo: { spatial: false, fieldRestrict: [] },
          PropertyIsNotEqualTo: { spatial: false, fieldRestrict: [] },
          Intersects: { spatial: true, fieldRestrict: [] },
          Within: { spatial: true, fieldRestrict: [] },
        };
        break;
      case 'basic':
        effectiveOperators = {
          PropertyIsEqualTo: { spatial: false, fieldRestrict: [] },
          PropertyIsNotEqualTo: { spatial: false, fieldRestrict: [] }
        };
        break;
      case 'basicnumeric':
        effectiveOperators = {
          PropertyIsEqualTo: { spatial: false, fieldRestrict: [] },
          PropertyIsNotEqualTo: { spatial: false, fieldRestrict: [] },
          PropertyIsGreaterThan: { spatial: false, fieldRestrict: ['number'] },
          PropertyIsGreaterThanOrEqualTo: { spatial: false, fieldRestrict: ['number'] },
          PropertyIsLessThan: { spatial: false, fieldRestrict: ['number'] },
          PropertyIsLessThanOrEqualTo: { spatial: false, fieldRestrict: ['number'] },
        };
        break;
      default:
        effectiveOperators = {
          PropertyIsEqualTo: { spatial: false, fieldRestrict: [] },
          PropertyIsNotEqualTo: { spatial: false, fieldRestrict: [] },
          Intersects: { spatial: true, fieldRestrict: [] },
          Within: { spatial: true, fieldRestrict: [] },
        };
    }

    this.ogcFilterOperators = effectiveOperators;
  }

  updateField() {
    if (!this.datasource.options.sourceFields) {
      return;
    }
    this.fields = this.datasource.options.sourceFields
    .filter(sf => (sf.excludeFromOgcFilters === undefined || !sf.excludeFromOgcFilters));
    this.fields.filter(f => f.name === this.currentFilter.propertyName)
      .forEach(element => {
        this.values = element.values !== undefined ? element.values.sort() : [];
      });
  }

  toggleFilterState(event, filter: OgcInterfaceFilterOptions, property) {
    this.updateField();
    if (event.checked) {
      this.datasource.options.ogcFilters.interfaceOgcFilters
        .filter(f => f.filterid === filter.filterid)
        .forEach(element => {
          element[property] = true;
        });
    } else {
      this.removeOverlayByID(filter.filterid);
      this.datasource.options.ogcFilters.interfaceOgcFilters
        .filter(f => f.filterid === filter.filterid)
        .forEach(element => {
          element[property] = false;
        });
    }
    this.refreshFilters();
  }

  deleteFilter(filter: OgcInterfaceFilterOptions) {
    const ogcFilters: OgcFiltersOptions = this.datasource.options.ogcFilters;
    ogcFilters.interfaceOgcFilters = ogcFilters.interfaceOgcFilters.filter(
      f => f.filterid !== filter.filterid
    );
    this.removeOverlayByID(filter.filterid);

    this.refreshFilters();
  }

  changeNumericProperty(filter: OgcInterfaceFilterOptions, property, value) {
    this.changeProperty(filter, property, parseFloat(value));
    this.refreshFilters();
  }

  private removeOverlayByID(id) {
    const overlayId = this.baseOverlayName + id;
    if (this.map.overlay.dataSource.ol.getFeatureById(overlayId)) {
      this.map.overlay.dataSource.ol.removeFeature(
        this.map.overlay.dataSource.ol.getFeatureById(overlayId)
      );
    }
  }

  changeOperator(filter) {
    if (this.ogcFilterOperators[filter.operator].spatial === false) {
      this.removeOverlayByID(filter.filterid);
    }
    this.refreshFilters();
  }

  changeProperty(filter: OgcInterfaceFilterOptions, property, value) {
    this.datasource.options.ogcFilters.interfaceOgcFilters
      .filter(f => f.filterid === filter.filterid)
      .forEach(element => {
        element[property] = value;
      });
    this.refreshFilters();
  }

  changeGeometry(filter, value?) {
    const checkSNRC50k = /\d{2,3}[a-l][0,1][0-9]/gi;
    const checkSNRC250k = /\d{2,3}[a-p]/gi;
    const checkSNRC1m = /\d{2,3}/gi;
    const mapProjection = this.map.projection;
    this.removeOverlayByID(filter.filterid);
    this.datasource.options.ogcFilters.interfaceOgcFilters
      .filter(f => f.filterid === filter.filterid)
      .forEach(element => {
        let wktPoly;
        if (filter.igoSpatialSelector === 'snrc') {
          if (value === '' && this.snrc !== '') {
            wktPoly = this.wktService.snrcToWkt(this.snrc).wktPoly;
            element.wkt_geometry = wktPoly;
          } else if (
            value !== '' &&
            (checkSNRC1m.test(value) ||
              checkSNRC250k.test(value) ||
              checkSNRC50k.test(value))
          ) {
            wktPoly = this.wktService.snrcToWkt(value).wktPoly;
            element.wkt_geometry = wktPoly;
          }
        } else if (filter.igoSpatialSelector === 'fixedExtent') {
          wktPoly = this.wktService.extentToWkt(
            mapProjection,
            this.map.getExtent(),
            mapProjection
          ).wktPoly;
          element.wkt_geometry = wktPoly;
        }
      });
    this.refreshFilters();
  }
}
