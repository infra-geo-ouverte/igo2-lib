import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IgoFormModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { InteractiveSelectionFormComponent } from './interactive-selection.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    IgoLanguageModule,
    IgoFormModule
  ],
  exports: [InteractiveSelectionFormComponent],
  declarations: [InteractiveSelectionFormComponent]
})
export class IgoInteractiveSelectionFormModule {}
