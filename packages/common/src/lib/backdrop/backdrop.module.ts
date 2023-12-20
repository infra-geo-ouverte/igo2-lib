import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { BackdropComponent } from './backdrop.component';

@NgModule({
  imports: [CommonModule, BackdropComponent],
  exports: [BackdropComponent]
})
export class IgoBackdropModule {
  static forRoot(): ModuleWithProviders<IgoBackdropModule> {
    return {
      ngModule: IgoBackdropModule,
      providers: []
    };
  }
}
