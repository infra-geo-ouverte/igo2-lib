import { OgcFilterButtonComponent } from './ogc-filter-button';
import { OgcFilterFormComponent } from './ogc-filter-form';
import { OgcFilterSelectionComponent } from './ogc-filter-selection';
import {
  OgcFilterTimeComponent,
  OgcFilterTimeSliderComponent
} from './ogc-filter-time';
import { OgcFilterableFormComponent } from './ogc-filterable-form';
import { OgcFilterableItemComponent } from './ogc-filterable-item';
import {
  OgcFilterableListBindingDirective,
  OgcFilterableListComponent
} from './ogc-filterable-list';
import { FilterableDataSourcePipe } from './shared';
import { SpatialFilterItemComponent } from './spatial-filter/spatial-filter-item';
import { SpatialFilterListComponent } from './spatial-filter/spatial-filter-list';
import { SpatialFilterTypeComponent } from './spatial-filter/spatial-filter-type';
import { TimeFilterButtonComponent } from './time-filter-button';
import { TimeFilterFormComponent } from './time-filter-form';
import { TimeFilterItemComponent } from './time-filter-item';
import {
  TimeFilterListBindingDirective,
  TimeFilterListComponent
} from './time-filter-list';

export * from './shared';
export * from './time-filter-form';
export * from './time-filter-item';
export * from './time-filter-list';
export * from './ogc-filterable-form';
export * from './ogc-filterable-item';
export * from './ogc-filterable-list';
export * from './ogc-filter-form';
export * from './ogc-filter-selection';
export * from './ogc-filter-button';
export * from './ogc-filter-chips';
export * from './ogc-filter-time';
export * from './time-filter-button';
export * from './spatial-filter/spatial-filter-type';
export * from './spatial-filter/spatial-filter-list';
export * from './spatial-filter/spatial-filter-item';

export const FILTER_DIRECTIVES = [
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
  OgcFilterTimeSliderComponent
] as const;
