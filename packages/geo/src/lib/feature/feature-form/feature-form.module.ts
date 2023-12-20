import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgoFormModule } from '@igo2/common';

import { FeatureFormComponent } from './feature-form.component';

/**
 * @ignore
 */
@NgModule({
    imports: [CommonModule, IgoFormModule, FeatureFormComponent],
    exports: [IgoFormModule, FeatureFormComponent]
})
export class IgoFeatureFormModule {}
