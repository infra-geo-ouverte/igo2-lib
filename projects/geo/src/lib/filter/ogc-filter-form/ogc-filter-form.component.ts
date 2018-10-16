import {
  Component,
  Input,
  ChangeDetectorRef,
  AfterContentChecked
} from '@angular/core';

import {
  OgcInterfaceFilterOptions,
  OgcFilterableDataSource,
  OgcFiltersOptions
} from '../../filter/shared/ogc-filter.interface';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import { WktService } from '../../wkt/shared/wkt.service';
import { IgoMap } from '../../map';

@Component({
  selector: 'igo-ogc-filter-form',
  templateUrl: './ogc-filter-form.component.html',
  styleUrls: ['./ogc-filter-form.component.scss']
})
export class OgcFilterFormComponent implements AfterContentChecked {
  private ogcFilterWriter: OgcFilterWriter;
  private _dataSource: OgcFilterableDataSource;
  private _currentFilter: any = {};
  public operators;
  public igoSpatialSelectors;
  public value = '';
  public inputOperator;
  public fields: any[];
  public values: any[];
  public color = 'primary';
  public snrc = '';
  public disabled;
  private _map: IgoMap;
  public baseOverlayName = 'ogcFilterOverlay_';
  private _showFeatureOnMap: Boolean;

  @Input() refreshFilters: Function;

  @Input()
  get datasource(): OgcFilterableDataSource {
    return this._dataSource;
  }
  set datasource(value: OgcFilterableDataSource) {
    this._dataSource = value;
    this.cdRef.detectChanges();
  }

  @Input()
  get showFeatureOnMap(): Boolean {
    return this._showFeatureOnMap;
  }
  set showFeatureOnMap(value: Boolean) {
    this._showFeatureOnMap = value;
  }

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }

  @Input()
  get currentFilter(): any {
    return this._currentFilter;
  }
  set currentFilter(value: any) {
    this._currentFilter = value;
  }

  get activeFilters() {
    this.updateField();
    return this.datasource.options.ogcFilters.interfaceOgcFilters.filter(
      f => f.active === true
    );
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private wktService: WktService
  ) {
    this.ogcFilterWriter = new OgcFilterWriter();
    // TODO: Filter permitted operator based on wfscapabilities
    // Need to work on regex on XML capabilities because
    // comaparison operator's name varies between WFS servers...
    // Ex: IsNull vs PropertyIsNull vs IsNil ...
    this.operators = this.ogcFilterWriter.operators;
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

  ngAfterContentChecked() {
    if (this.map) {
      this.activeFilters
        .filter(
          af => ['Contains', 'Intersects', 'Within'].indexOf(af.operator) !== -1
        )
        .forEach(activeFilterSpatial => {
          if (activeFilterSpatial.wkt_geometry) {
            this.addWktAsOverlay(
              activeFilterSpatial.wkt_geometry,
              activeFilterSpatial.filterid,
              this.map.projection
            );
          }
        });
    }
  }

  updateField(init = true) {
    if (!this.datasource.options.sourceFields) {
      return;
    }
    this.fields = this.datasource.options.sourceFields.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });
    this.datasource.options.sourceFields
      .filter(f => f.name === this.currentFilter.propertyName)
      .forEach(element => {
        this.values = element.values !== undefined ? element.values.sort() : [];
      });
  }

  private addWktAsOverlay(wkt, filterid, projection) {
    const wktAsFeature = this.wktService.wktToFeature(wkt, projection);
    wktAsFeature.setId(this.baseOverlayName + filterid);
    let opacity = 0;
    if (this.showFeatureOnMap) {
      opacity = 0.5;
    }
    wktAsFeature.setStyle(
      this.map.setOverlayDataSourceStyle([125, 136, 140, opacity], 2, [
        125,
        136,
        140,
        0
      ])
    );
    this.map.addOverlay(wktAsFeature);
  }

  toggleFilterState(event, filter: OgcInterfaceFilterOptions, property) {
    this.updateField();
    const mapProjection = this.map.projection;
    if (event.checked) {
      if (filter.wkt_geometry !== '') {
        this.addWktAsOverlay(
          filter.wkt_geometry,
          filter.filterid,
          mapProjection
        );
      }
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
    this.map.removeOverlayByID(this.baseOverlayName + id);
  }

  changeOperator(filter) {
    if (this.operators[filter.operator].spatial === false) {
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
        if (wktPoly) {
          this.addWktAsOverlay(wktPoly, filter.filterid, mapProjection);
        }
      });
    this.refreshFilters();
  }
}
