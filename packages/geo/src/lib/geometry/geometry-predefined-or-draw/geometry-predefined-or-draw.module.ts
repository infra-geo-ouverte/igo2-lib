import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { IgoLanguageModule } from '@igo2/core';
import { GeometryPredefinedOrDrawTypeComponent } from './geometry-predefined-or-draw/geometry-predefined-or-draw.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GeometryPredefinedListComponent }
  from './geometry-predefined-list/geometry-predefined-list.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    IgoLanguageModule,
    MatOptionModule,
    MatSelectModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatAutocompleteModule
  ],
  exports: [
    GeometryPredefinedOrDrawTypeComponent,
    GeometryPredefinedListComponent
  ],
  declarations: [
    GeometryPredefinedOrDrawTypeComponent,
    GeometryPredefinedListComponent
  ]
})
export class IgoGeometryPredefinedOrDrawModule { }
