import { NgModule, ModuleWithProviders } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Md2Module } from 'md2';

import { IgoSharedModule } from '../shared';

import { FilterableLayerPipe } from './shared';
import { TimeFilterFormComponent } from './time-filter-form';
import { TimeFilterItemComponent } from './time-filter-item';
import { TimeFilterListComponent,
         TimeFilterListBindingDirective } from './time-filter-list/';

@NgModule({
  imports: [
    IgoSharedModule,
    ReactiveFormsModule,
    Md2Module
  ],
  exports: [
    FilterableLayerPipe,
    TimeFilterFormComponent,
    TimeFilterItemComponent,
    TimeFilterListComponent,
    TimeFilterListBindingDirective
  ],
  declarations: [
    FilterableLayerPipe,
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
      providers: []
    };
  }
}

export * from './shared';
export * from './time-filter-form';
export * from './time-filter-item';
export * from './time-filter-list';
