import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatIconModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { ShareMapComponent } from './share-map/share-map.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    IgoLanguageModule
  ],
  exports: [ShareMapComponent],
  declarations: [ShareMapComponent]
})
export class IgoShareMapModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoShareMapModule
    };
  }
}
