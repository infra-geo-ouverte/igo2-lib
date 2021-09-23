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

import { DirectionsFormComponent } from './directions-form/directions-form.component';
import { DirectionsFormBindingDirective } from './directions-form/directions-form-binding.directive';
import { DirectionsFormService } from './directions-form/directions-form.service';
import { provideDirectionsSourceService } from './shared/directions-source.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DirectionsFormComponent2 } from './directions-form2/directions-form2.component';

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
  exports: [DirectionsFormComponent,DirectionsFormComponent2, DirectionsFormBindingDirective],
  declarations: [DirectionsFormComponent,DirectionsFormComponent2, DirectionsFormBindingDirective],
  providers: [DirectionsFormService, provideDirectionsSourceService()]
})
export class IgoDirectionsModule {
  static forRoot(): ModuleWithProviders<IgoDirectionsModule> {
    return {
      ngModule: IgoDirectionsModule
    };
  }
}
