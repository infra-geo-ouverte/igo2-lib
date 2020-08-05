import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SpinnerActivityDirective } from './spinner-activity.directive';
import { SpinnerComponent } from './spinner.component';

@NgModule({
  imports: [CommonModule, MatProgressSpinnerModule],
  declarations: [SpinnerActivityDirective, SpinnerComponent],
  exports: [SpinnerActivityDirective, SpinnerComponent]
})
export class IgoSpinnerModule {}
