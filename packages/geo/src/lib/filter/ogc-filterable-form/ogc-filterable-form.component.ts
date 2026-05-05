import { Component, input } from '@angular/core';
import { MAT_AUTOCOMPLETE_DEFAULT_OPTIONS } from '@angular/material/autocomplete';
import { MAT_SELECT_CONFIG } from '@angular/material/select';

import { ListItemDirective } from '@igo2/common/list';

import { MapBase } from '../../map';
import { OgcFilterFormComponent } from '../ogc-filter-form/ogc-filter-form.component';
import { OgcFilterSelectionComponent } from '../ogc-filter-selection/ogc-filter-selection.component';
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
  ],
  imports: [
    OgcFilterSelectionComponent,
    ListItemDirective,
    OgcFilterFormComponent
  ]
})
export class OgcFilterableFormComponent {
  readonly datasource = input<OgcFilterableDataSource>(undefined);

  readonly map = input<MapBase>(undefined);

  readonly refreshFilters = input<() => void>(undefined);

  get refreshFunc() {
    return this.refreshFilters();
  }

  get advancedOgcFilters(): boolean {
    const datasource = this.datasource();
    if (datasource.options.ogcFilters) {
      return datasource.options.ogcFilters.advancedOgcFilters;
    }
    return;
  }

  get currentFilter(): any {
    const datasource = this.datasource();
    return datasource.options.ogcFilters.interfaceOgcFilters
      ? datasource.options.ogcFilters.interfaceOgcFilters[0]
      : undefined;
  }

  public color = 'primary';
}
