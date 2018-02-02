import { NgModule, ModuleWithProviders } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule,
         MatNativeDateModule,
         MAT_DATE_LOCALE} from '@angular/material';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core';

import { IgoSharedModule } from '../shared';

import { FilterableDataSourcePipe } from './shared';
import { TimeFilterFormComponent } from './time-filter-form';
import { TimeFilterItemComponent } from './time-filter-item';
import { TimeFilterListComponent,
         TimeFilterListBindingDirective } from './time-filter-list/';

@NgModule({
  imports: [
    IgoSharedModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDatetimepickerModule,
    MatNativeDatetimeModule
  ],
  exports: [
    FilterableDataSourcePipe,
    TimeFilterFormComponent,
    TimeFilterItemComponent,
    TimeFilterListComponent,
    TimeFilterListBindingDirective
  ],
  declarations: [
    FilterableDataSourcePipe,
    TimeFilterFormComponent,
    TimeFilterItemComponent,
    TimeFilterListComponent,
    TimeFilterListBindingDirective
  ]
})
export class IgoFilterModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoFilterModule,
      providers: [{
        provide: MAT_DATE_LOCALE,
        useValue: 'fr'
      }]
    };
  }
}
