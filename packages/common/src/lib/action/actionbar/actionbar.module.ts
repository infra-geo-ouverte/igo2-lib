import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { ActionbarComponent } from './actionbar.component';
import { ActionbarItemComponent } from './actionbar-item.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatListModule,
    MatCardModule,
    MatCheckboxModule
  ],
  exports: [ActionbarComponent],
  declarations: [ActionbarComponent, ActionbarItemComponent]
})
export class IgoActionbarModule {}
