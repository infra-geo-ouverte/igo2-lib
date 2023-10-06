import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgoEntityAutocompleteFieldComponent } from './entity-autocomplete-field/entity-autocomplete-field.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IgoEntitySelectFieldComponent } from './entity-select-field/entity-select-field.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    IgoEntityAutocompleteFieldComponent,
    IgoEntitySelectFieldComponent
  ],
  exports: [IgoEntityAutocompleteFieldComponent, IgoEntitySelectFieldComponent],
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule
  ]
})
export class IgoEntityFieldsModule {}
