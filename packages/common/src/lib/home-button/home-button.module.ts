import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgoLanguageModule } from '@igo2/core';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
