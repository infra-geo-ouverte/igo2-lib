import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatIconModule,
  MatButtonModule,
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
  MAT_DATE_LOCALE
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

import { FilterableDataSourcePipe } from './shared/filterable-datasource.pipe';
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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
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
    IgoCollapsibleModule,
    IgoListModule,
    IgoKeyValueModule
  ],
  exports: [
    FilterableDataSourcePipe,
    TimeFilterFormComponent,
    TimeFilterItemComponent,
    TimeFilterListComponent,
    TimeFilterListBindingDirective,
    OgcFilterFormComponent,
    OgcFilterButtonComponent,
    OgcFilterableFormComponent,
    OgcFilterableItemComponent,
    OgcFilterableListComponent,
    OgcFilterableListBindingDirective
  ],
  declarations: [
    FilterableDataSourcePipe,
    TimeFilterFormComponent,
    TimeFilterItemComponent,
    TimeFilterListComponent,
    TimeFilterListBindingDirective,
    OgcFilterFormComponent,
    OgcFilterButtonComponent,
    OgcFilterableFormComponent,
    OgcFilterableItemComponent,
    OgcFilterableListComponent,
    OgcFilterableListBindingDirective
  ],
  providers: [TimeFilterService, OGCFilterService]
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
