import { ModuleWithProviders, NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { OgcFilterButtonComponent } from './ogc-filter-button/ogc-filter-button.component';
import { OgcFilterFormComponent } from './ogc-filter-form/ogc-filter-form.component';
import { OgcFilterSelectionComponent } from './ogc-filter-selection/ogc-filter-selection.component';
import { OgcFilterTimeSliderComponent } from './ogc-filter-time/ogc-filter-time-slider.component';
import { OgcFilterTimeComponent } from './ogc-filter-time/ogc-filter-time.component';
import { OgcFilterableFormComponent } from './ogc-filterable-form/ogc-filterable-form.component';
import { OgcFilterableItemComponent } from './ogc-filterable-item/ogc-filterable-item.component';
import { OgcFilterableListBindingDirective } from './ogc-filterable-list/ogc-filterable-list-binding.directive';
import { OgcFilterableListComponent } from './ogc-filterable-list/ogc-filterable-list.component';
import { FilterableDataSourcePipe } from './shared/filterable-datasource.pipe';
import { OGCFilterTimeService } from './shared/ogc-filter-time.service';
import { OGCFilterService } from './shared/ogc-filter.service';
import { SpatialFilterService } from './shared/spatial-filter.service';
import { TimeFilterService } from './shared/time-filter.service';
import { SpatialFilterItemComponent } from './spatial-filter/spatial-filter-item/spatial-filter-item.component';
import { SpatialFilterListComponent } from './spatial-filter/spatial-filter-list/spatial-filter-list.component';
import { SpatialFilterTypeComponent } from './spatial-filter/spatial-filter-type/spatial-filter-type.component';
import { TimeFilterButtonComponent } from './time-filter-button/time-filter-button.component';
import { TimeFilterFormComponent } from './time-filter-form/time-filter-form.component';
import { TimeFilterItemComponent } from './time-filter-item/time-filter-item.component';
import { TimeFilterListBindingDirective } from './time-filter-list/time-filter-list-binding.directive';
import { TimeFilterListComponent } from './time-filter-list/time-filter-list.component';
import { OgcFilterChipsComponent } from './ogc-filter-chips/ogc-filter-chips.component';

const DIRECTIVES = [
  FilterableDataSourcePipe,
  TimeFilterButtonComponent,
  TimeFilterFormComponent,
  TimeFilterItemComponent,
  TimeFilterListComponent,
  TimeFilterListBindingDirective,
  OgcFilterFormComponent,
  OgcFilterButtonComponent,
  OgcFilterSelectionComponent,
  OgcFilterableFormComponent,
  OgcFilterableItemComponent,
  OgcFilterableListComponent,
  OgcFilterableListBindingDirective,
  SpatialFilterTypeComponent,
  SpatialFilterListComponent,
  SpatialFilterItemComponent,
  OgcFilterTimeComponent,
  OgcFilterTimeSliderComponent,
  OgcFilterableListComponent,
  OgcFilterChipsComponent
];
/**
 * @deprecated import the components directly or the FILTER_DIRECTIVES for the set
 */
@NgModule({
  imports: DIRECTIVES,
  exports: DIRECTIVES,
  providers: [
    TimeFilterService,
    OGCFilterService,
    OGCFilterTimeService,
    SpatialFilterService
  ]
})
export class IgoFilterModule {
  static forRoot(): ModuleWithProviders<IgoFilterModule> {
    return {
      ngModule: IgoFilterModule,
      providers: [
        {
          provide: MAT_DATE_LOCALE,
          useValue: 'fr-FR'
        }
      ]
    };
  }
}
