import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackdropComponent } from './backdrop.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BackdropComponent],
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
