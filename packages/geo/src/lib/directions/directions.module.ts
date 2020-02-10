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

import { DirectionsFormComponent } from './directions-form/directions-form.component';
import { DirectionsFormBindingDirective } from './directions-form/directions-form-binding.directive';
import { DirectionsFormService } from './directions-form/directions-form.service';
import { provideDirectionsSourceService } from './shared/directions-source.service';

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
  exports: [DirectionsFormComponent, DirectionsFormBindingDirective],
  declarations: [DirectionsFormComponent, DirectionsFormBindingDirective],
  providers: [DirectionsFormService, provideDirectionsSourceService()]
})
export class IgoDirectionsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoDirectionsModule
    };
  }
}
