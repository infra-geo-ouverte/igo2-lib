import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  static forRoot(): ModuleWithProviders<IgoShareMapModule> {
    return {
      ngModule: IgoShareMapModule
    };
  }
}
