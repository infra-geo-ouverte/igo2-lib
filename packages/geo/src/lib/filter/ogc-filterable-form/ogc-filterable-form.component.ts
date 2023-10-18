import { Component, Input } from '@angular/core';
import { MAT_AUTOCOMPLETE_DEFAULT_OPTIONS } from '@angular/material/autocomplete';
import { MAT_SELECT_CONFIG } from '@angular/material/select';

import { IgoMap } from '../../map/shared';
import { OgcFilterableDataSource } from '../shared/ogc-filter.interface';

@Component({
  selector: 'igo-ogc-filterable-form',
  templateUrl: './ogc-filterable-form.component.html',
  styles: ['::ng-deep.igo-overlay-panel-width { min-width: fit-content;}'],
  providers: [
    {
      provide: MAT_SELECT_CONFIG,
      useValue: { overlayPanelClass: 'igo-overlay-panel-width' }
    },
    {
      provide: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,
      useValue: { overlayPanelClass: 'igo-overlay-panel-width' }
    }
  ]
})
export class OgcFilterableFormComponent {
  @Input() datasource: OgcFilterableDataSource;

  @Input() map: IgoMap;

  @Input() refreshFilters: () => void;

  get refreshFunc() {
    return this.refreshFilters;
  }

  get advancedOgcFilters(): boolean {
    if (this.datasource.options.ogcFilters) {
      return this.datasource.options.ogcFilters.advancedOgcFilters;
    }
    return;
  }

  get currentFilter(): any {
    return this.datasource.options.ogcFilters.interfaceOgcFilters
      ? this.datasource.options.ogcFilters.interfaceOgcFilters[0]
      : undefined;
  }

  public color = 'primary';

  constructor() {}
}
