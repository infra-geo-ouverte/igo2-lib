import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';

import { IgoLanguageModule } from '@igo2/core';

import { IgoFormFieldModule } from '../form-field/form-field.module';
import { FormGroupComponent } from './form-group.component';

/**
 * @ignore
 */
@NgModule({
    imports: [
        CommonModule,
        MatFormFieldModule,
        IgoLanguageModule,
        IgoFormFieldModule,
        FormGroupComponent
    ],
    exports: [FormGroupComponent]
})
export class IgoFormGroupModule {}
