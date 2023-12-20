import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoEntityTableModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { DrawLayerPopupComponent } from './draw-layer-popup.component';
import { DrawPopupComponent } from './draw-popup.component';
import { DrawShorcutsComponent } from './draw-shorcuts.component';
import { DrawComponent } from './draw.component';

/**
 * @ignore
 */
@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatBadgeModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatDialogModule,
        IgoLanguageModule,
        IgoEntityTableModule,
        MatRadioModule,
        MatCheckboxModule,
        DrawComponent,
        DrawPopupComponent,
        DrawLayerPopupComponent,
        DrawShorcutsComponent
    ],
    exports: [DrawComponent]
})
export class IgoDrawModule {}
