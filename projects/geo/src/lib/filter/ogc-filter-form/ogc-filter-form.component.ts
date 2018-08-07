import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';

import { LanguageService } from '@igo2/core';

import {
  OgcInterfaceFilterOptions,
  OgcFilterableDataSource,
  OgcFiltersOptions
} from '../../filter/shared/ogc-filter.interface';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import { WktService } from '../../wkt/shared/wkt.service';

@Component({
  selector: 'igo-ogc-filter-form',
  templateUrl: './ogc-filter-form.component.html',
  styleUrls: ['./ogc-filter-form.component.scss']
})
export class OgcFilterFormComponent {
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

  @Input()
  get datasource(): OgcFilterableDataSource {
    return this._dataSource;
  }
  set datasource(value: OgcFilterableDataSource) {
    this._dataSource = value;
    this.cdRef.detectChanges();
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
    private wktService: WktService,
    private languageService: LanguageService
  ) {
    this.ogcFilterWriter = new OgcFilterWriter();
    // TODO: Filter permitted operator based on wfscapabilities
    // Need to work on regex on XML capabilities because
    // comaparison operator's name varies between WFS servers...
    // Ex: IsNull vs PropertyIsNull vs IsNil ...
    this.operators = this.ogcFilterWriter.operators;
    for (const property in this.operators) {
      if (this.operators.hasOwnProperty(property)) {
        this.operators[property] = Object.assign({}, this.operators[property], {
          alias: property
          // alias: this.languageService.translate.instant(
          //   'igo.geo.operators.' + property
          // )
        });
      }
    }
    this.igoSpatialSelectors = [
      {
        type: 'fixedExtent',
        alias: 'fixedExtent'
        // alias: this.languageService.translate.instant(
        //   'igo.geo.spatialSelector.fixedExtent'
        // )
      },
      {
        type: 'snrc',
        alias: 'snrc'
        // alias: this.languageService.translate.instant(
        //   'igo.geo.spatialSelector.snrc'
        // )
      }
    ];
    // TODO: selectFeature & drawFeature
  }

  disableRefreshFilter() {
    this.datasource.options['disableRefreshFilter'] = false;
  }

  updateField(init = true) {
    if (!init) {
      this.disableRefreshFilter();
    }
    if (!this.datasource.options['sourceFields']) {
      return;
    }
    this.fields = this.datasource.options['sourceFields'].sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });
    this.datasource.options['sourceFields']
      .filter(f => f.name === this.currentFilter.propertyName)
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
      this.datasource.options.ogcFilters.interfaceOgcFilters
        .filter(f => f.filterid === filter.filterid)
        .forEach(element => {
          element[property] = false;
        });
    }
    this.disableRefreshFilter();
  }

  deleteFilter(filter: OgcInterfaceFilterOptions) {
    const ogcFilters: OgcFiltersOptions = this.datasource.options.ogcFilters;
    ogcFilters.interfaceOgcFilters = ogcFilters.interfaceOgcFilters.filter(
      f => f.filterid !== filter.filterid
    );
    this.disableRefreshFilter();
  }

  changeNumericProperty(filter: OgcInterfaceFilterOptions, property, value) {
    this.changeProperty(filter, property, parseFloat(value));
    this.disableRefreshFilter();
  }

  changeProperty(filter: OgcInterfaceFilterOptions, property, value) {
    this.datasource.options.ogcFilters.interfaceOgcFilters
      .filter(f => f.filterid === filter.filterid)
      .forEach(element => {
        element[property] = value;
      });
    this.disableRefreshFilter();
  }

  changeGeometry(filter, value?) {
    this.datasource.options.ogcFilters.interfaceOgcFilters
      .filter(f => f.filterid === filter.filterid)
      .forEach(element => {
        if (filter['igoSpatialSelector'] === 'snrc') {
          element['wkt_geometry'] = this.wktService.snrcWKT(value);
        } else {
          if (filter['igoSpatialSelector'] === 'fixedExtent') {
            element['wkt_geometry'] = this.wktService.mapExtentToWKT();
          }
        }
      });
    this.disableRefreshFilter();
  }
}
