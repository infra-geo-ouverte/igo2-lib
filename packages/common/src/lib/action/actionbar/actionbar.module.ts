import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

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
