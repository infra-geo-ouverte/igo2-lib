import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { ActionbarItemComponent } from './actionbar-item.component';
import { ActionbarComponent } from './actionbar.component';

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
        MatCheckboxModule,
        ActionbarComponent, ActionbarItemComponent
    ],
    exports: [ActionbarComponent]
})
export class IgoActionbarModule {}
