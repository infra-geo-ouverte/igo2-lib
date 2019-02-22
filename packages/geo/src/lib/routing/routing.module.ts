import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  MatIconModule,
  MatButtonModule,
  MatListModule,
  MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatTooltipModule,
  MatAutocompleteModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { RoutingFormComponent } from './routing-form/routing-form.component';
import { RoutingFormBindingDirective } from './routing-form/routing-form-binding.directive';
import { RoutingFormService } from './routing-form/routing-form.service';
import { provideRoutingSourceService } from './shared/routing-source.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatTooltipModule,
    MatAutocompleteModule,
    IgoLanguageModule
  ],
  exports: [RoutingFormComponent, RoutingFormBindingDirective],
  declarations: [RoutingFormComponent, RoutingFormBindingDirective],
  providers: [RoutingFormService, provideRoutingSourceService()]
})
export class IgoRoutingModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoRoutingModule
    };
  }
}
