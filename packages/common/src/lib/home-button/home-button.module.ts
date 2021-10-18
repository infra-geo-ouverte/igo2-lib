import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgoLanguageModule } from '@igo2/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HomeButtonComponent } from './home-button.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    IgoLanguageModule
  ],
  exports: [HomeButtonComponent],
  declarations: [HomeButtonComponent],
  providers: []
})
export class IgoHomeButtonModule {}
