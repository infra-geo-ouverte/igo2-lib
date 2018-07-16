import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material';

import { SpinnerBindingDirective } from './spinner-binding.directive';
import { SpinnerComponent } from './spinner.component';

@NgModule({
  imports: [CommonModule, MatProgressSpinnerModule],
  declarations: [SpinnerBindingDirective, SpinnerComponent],
  exports: [SpinnerBindingDirective, SpinnerComponent]
})
export class IgoSpinnerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoSpinnerModule,
      providers: []
    };
  }
}
