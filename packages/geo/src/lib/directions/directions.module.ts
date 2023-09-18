import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

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
