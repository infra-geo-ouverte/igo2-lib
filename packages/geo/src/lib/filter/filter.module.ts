import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatIconModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatFormFieldModule,
  MatTableModule,
  MatTreeModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatListModule,
  MatTooltipModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MAT_DATE_LOCALE,
  MatCheckboxModule,
  MatTabsModule,
  MatRadioModule,
  MatMenuModule
} from '@angular/material';

import {
  MatDatetimepickerModule,
  MatNativeDatetimeModule
} from '@mat-datetimepicker/core';

import { IgoLanguageModule } from '@igo2/core';
import {
  IgoCollapsibleModule,
  IgoListModule,
  IgoKeyValueModule
} from '@igo2/common';
import { IgoGeometryModule } from './../geometry/geometry.module';

import { FilterableDataSourcePipe } from './shared/filterable-datasource.pipe';
import { IgoLayerModule } from '../layer/layer.module';
import { TimeFilterButtonComponent } from './time-filter-button/time-filter-button.component';
import { TimeFilterFormComponent } from './time-filter-form/time-filter-form.component';
import { TimeFilterItemComponent } from './time-filter-item/time-filter-item.component';
import { TimeFilterListBindingDirective } from './time-filter-list/time-filter-list-binding.directive';
import { TimeFilterListComponent } from './time-filter-list/time-filter-list.component';
import { TimeFilterService } from './shared/time-filter.service';

import { OgcFilterFormComponent } from './ogc-filter-form/ogc-filter-form.component';
import { OgcFilterableFormComponent } from './ogc-filterable-form/ogc-filterable-form.component';
import { OgcFilterableItemComponent } from './ogc-filterable-item/ogc-filterable-item.component';
import { OgcFilterableListBindingDirective } from './ogc-filterable-list/ogc-filterable-list-binding.directive';
import { OgcFilterableListComponent } from './ogc-filterable-list/ogc-filterable-list.component';
import { OgcFilterButtonComponent } from './ogc-filter-button/ogc-filter-button.component';
import { OGCFilterService } from './shared/ogc-filter.service';
import { OgcFilterToggleButtonComponent } from './ogc-filter-toggle-button/ogc-filter-toggle-button.component';

import { SpatialFilterTypeComponent } from './spatial-filter/spatial-filter-type/spatial-filter-type.component';
import { SpatialFilterListComponent } from './spatial-filter/spatial-filter-list/spatial-filter-list.component';
import { SpatialFilterItemComponent } from './spatial-filter/spatial-filter-item/spatial-filter-item.component';
import { SpatialFilterService } from './shared/spatial-filter.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatRadioModule,
    MatMenuModule,
    MatTableModule,
    MatTreeModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatListModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDatetimepickerModule,
    MatNativeDatetimeModule,
    IgoLanguageModule,
    IgoLayerModule,
    IgoCollapsibleModule,
    IgoListModule,
    IgoKeyValueModule,
    IgoGeometryModule
  ],
  exports: [
    FilterableDataSourcePipe,
    TimeFilterButtonComponent,
    TimeFilterFormComponent,
    TimeFilterItemComponent,
    TimeFilterListComponent,
    TimeFilterListBindingDirective,
    OgcFilterFormComponent,
    OgcFilterButtonComponent,
    OgcFilterToggleButtonComponent,
    OgcFilterableFormComponent,
    OgcFilterableItemComponent,
    OgcFilterableListComponent,
    OgcFilterableListBindingDirective,
    SpatialFilterTypeComponent,
    SpatialFilterListComponent,
    SpatialFilterItemComponent
  ],
  declarations: [
    FilterableDataSourcePipe,
    TimeFilterButtonComponent,
    TimeFilterFormComponent,
    TimeFilterItemComponent,
    TimeFilterListComponent,
    TimeFilterListBindingDirective,
    OgcFilterFormComponent,
    OgcFilterButtonComponent,
    OgcFilterToggleButtonComponent,
    OgcFilterableFormComponent,
    OgcFilterableItemComponent,
    OgcFilterableListComponent,
    OgcFilterableListBindingDirective,
    SpatialFilterTypeComponent,
    SpatialFilterListComponent,
    SpatialFilterItemComponent
  ],
  providers: [TimeFilterService, OGCFilterService, SpatialFilterService]
})
export class IgoFilterModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoFilterModule,
      providers: [
        {
          provide: MAT_DATE_LOCALE,
          useValue: 'fr'
        }
      ]
    };
  }
}
