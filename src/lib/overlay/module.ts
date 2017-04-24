import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { OverlayService } from './shared';
import { OverlayDirective } from './overlay';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    OverlayDirective
  ],
  declarations: [
    OverlayDirective
  ]
})
export class IgoOverlayModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoOverlayModule,
      providers: [
        OverlayService
      ]
    };
  }
}

export * from './shared';
export * from './overlay';
