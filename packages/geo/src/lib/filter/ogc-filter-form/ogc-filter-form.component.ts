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
import { FloatLabelType } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { SourceFieldsOptionsParams } from '../../datasource/shared/datasources/datasource.interface';

@Component({
  selector: 'igo-ogc-filter-form',
  templateUrl: './ogc-filter-form.component.html',
  styleUrls: ['./ogc-filter-form.component.scss']
})
export class OgcFilterFormComponent implements OnInit {
  public allOgcFilterOperators;
  public ogcFilterOperators$ = new BehaviorSubject<{ [key: string]: any }>(undefined);
  public igoSpatialSelectors;
  public value = '';
  public inputOperator;
  // public fields: any[];
  public fields$ = new BehaviorSubject<SourceFieldsOptionsParams[]>([]);
  public values: any[];
  public color = 'primary';
  public snrc = '';
  public disabled;
  public baseOverlayName = 'ogcFilterOverlay_';
  public currentFilter$ = new BehaviorSubject<any>(undefined);

  @Input() refreshFilters: () => void;

  @Input() datasource: OgcFilterableDataSource;

  @Input() map: IgoMap;

  @Input()
  set currentFilter(currentFilter: any) {
    this.currentFilter$.next(currentFilter);
  }
  get currentFilter(): any {
    return this.currentFilter$.value;
  }

  @Input() floatLabel: FloatLabelType = 'never';

  get activeFilters() {
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
    this.allOgcFilterOperators = new OgcFilterWriter().operators;
    this.ogcFilterOperators$.next(this.allOgcFilterOperators);
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
    this.updateField();
  }

  updateField() {
    if (!this.datasource.options.sourceFields) {
      return;
    }
    const fields = this.datasource.options.sourceFields
      .filter(sf => (sf.excludeFromOgcFilters === undefined || !sf.excludeFromOgcFilters));
    fields.filter(f => f.name === this.currentFilter.propertyName)
      .forEach(element => {
        this.values = element.values !== undefined ? element.values.sort() : [];
      });

    this.fields$.next(fields);
    const allowedOperators = new OgcFilterWriter().computeAllowedOperators(
      fields,
      this.currentFilter.propertyName,
      this.datasource.options.ogcFilters.allowedOperatorsType);
    this.ogcFilterOperators$.next(allowedOperators);
    if (Object.keys(allowedOperators).indexOf(this.currentFilter$.value.operator) === -1) {
      this.currentFilter$.value.operator = Object.keys(allowedOperators)[0];
    }
    this.refreshFilters();
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
    if (this.ogcFilterOperators$.value[filter.operator].spatial === false) {
      this.removeOverlayByID(filter.filterid);
    }
    this.refreshFilters();
  }

  // Issue with mapserver 7.2 and Postgis layers. Fixed in 7.4
  // Due to this issue, the checkbox is hide.
  changeCaseSensitive(matchCase) {
    this.currentFilter.matchCase = matchCase.checked;
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
            wktPoly = this.wktService.snrcToWkt(this.snrc, this.map.projection).wktPoly;
            element.wkt_geometry = wktPoly;
          } else if (
            value !== '' &&
            (checkSNRC1m.test(value) ||
              checkSNRC250k.test(value) ||
              checkSNRC50k.test(value))
          ) {
            wktPoly = this.wktService.snrcToWkt(value, this.map.projection).wktPoly;
            element.wkt_geometry = wktPoly;
          }
        } else if (filter.igoSpatialSelector === 'fixedExtent') {
          wktPoly = this.wktService.extentToWkt(
            mapProjection,
            this.map.viewController.getExtent(),
            mapProjection
          ).wktPoly;
          element.wkt_geometry = wktPoly;
        }
      });
    this.refreshFilters();
  }
}
