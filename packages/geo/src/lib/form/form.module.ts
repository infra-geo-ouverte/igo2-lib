import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatInputModule, MatFormFieldModule } from '@angular/material';

import { IgoMapModule } from '../map/map.module';
import { MapFieldComponent } from './fields/map-field/map-field.component';

@NgModule({
  imports: [FormsModule, MatInputModule, MatFormFieldModule, IgoMapModule],
  exports: [MapFieldComponent],
  declarations: [MapFieldComponent]
})
export class IgoFormModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoFormModule,
      providers: []
    };
  }
}
