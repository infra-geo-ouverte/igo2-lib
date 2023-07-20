import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { provideDirectionsSourceService } from './shared/directions-source.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DirectionsInputsComponent } from './directions-inputs/directions-inputs.component';
import { DirectionsComponent } from './directions.component';
import { DirectionsButtonsComponent } from './directions-buttons/directions-buttons.component';
import { DirectionsResultsComponent } from './directions-results/directions-results.component';

@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
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
  exports: [
    DirectionsComponent,
    DirectionsInputsComponent,
    DirectionsButtonsComponent,
    DirectionsResultsComponent
  ],
  declarations: [
     DirectionsComponent,
    DirectionsInputsComponent,
    DirectionsButtonsComponent,
    DirectionsResultsComponent
  ],
  providers: [provideDirectionsSourceService()]
})
export class IgoDirectionsModule {
  static forRoot(): ModuleWithProviders<IgoDirectionsModule> {
    return {
      ngModule: IgoDirectionsModule
    };
  }
}
