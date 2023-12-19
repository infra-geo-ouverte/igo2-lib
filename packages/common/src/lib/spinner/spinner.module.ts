import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SpinnerActivityDirective } from './spinner-activity.directive';
import { SpinnerComponent } from './spinner.component';

@NgModule({
    imports: [CommonModule, MatProgressSpinnerModule, SpinnerActivityDirective, SpinnerComponent],
    exports: [SpinnerActivityDirective, SpinnerComponent]
})
export class IgoSpinnerModule {}
