import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgoEntityAutocompleteFieldComponent } from './entity-autocomplete-field/entity-autocomplete-field.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [IgoEntityAutocompleteFieldComponent],
  exports: [IgoEntityAutocompleteFieldComponent],
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ]
})
export class IgoEntityFieldsModule {}
