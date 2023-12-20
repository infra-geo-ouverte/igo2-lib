import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { IgoImageModule, IgoKeyValueModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { FeatureDetailsComponent } from './feature-details.component';
import { FeatureDetailsDirective } from './feature-details.directive';

/**
 * @ignore
 */
@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        IgoLanguageModule,
        IgoKeyValueModule,
        IgoImageModule,
        FeatureDetailsComponent, FeatureDetailsDirective
    ],
    exports: [FeatureDetailsComponent, FeatureDetailsDirective]
})
export class IgoFeatureDetailsModule {}
