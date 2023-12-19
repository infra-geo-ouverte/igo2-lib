import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';

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
        IgoLanguageModule,
        HomeButtonComponent
    ],
    exports: [HomeButtonComponent],
    providers: []
})
export class IgoHomeButtonModule {}
