import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatTreeModule } from '@angular/material/tree';

import {
  MatDatetimepickerModule,
  MatNativeDatetimeModule
} from '@mat-datetimepicker/core';

import { IgoLanguageModule } from '@igo2/core';
import {
  IgoCollapsibleModule,
  IgoListModule,
  IgoKeyValueModule,
  IgoEntityModule,
  IgoDOMModule
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
import { OGCFilterTimeService } from './shared/ogc-filter-time.service';
import { OgcFilterSelectionComponent } from './ogc-filter-selection/ogc-filter-selection.component';

import { SpatialFilterTypeComponent } from './spatial-filter/spatial-filter-type/spatial-filter-type.component';
import { SpatialFilterListComponent } from './spatial-filter/spatial-filter-list/spatial-filter-list.component';
import { SpatialFilterItemComponent } from './spatial-filter/spatial-filter-item/spatial-filter-item.component';
import { SpatialFilterService } from './shared/spatial-filter.service';
import { OgcFilterTimeComponent } from './ogc-filter-time/ogc-filter-time.component';
import { OgcFilterTimeSliderComponent } from './ogc-filter-time/ogc-filter-time-slider.component';

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
    IgoEntityModule,
    IgoDOMModule,
    IgoKeyValueModule,
    IgoGeometryModule,
    MatBadgeModule
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
  ],
  providers: [TimeFilterService, OGCFilterService, OGCFilterTimeService, SpatialFilterService]
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
