import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { ShareMapComponent, ShareMapBindingDirective } from './share-map';
import { ShareMapService } from './shared';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    ShareMapComponent,
    ShareMapBindingDirective
  ],
  declarations: [
    ShareMapComponent,
    ShareMapBindingDirective
  ]
})
export class IgoShareMapModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoShareMapModule,
      providers: [
        ShareMapService
      ]
    };
  }
}
