import { ModuleWithProviders, NgModule } from '@angular/core';

import { DOMService } from './dom.service';

@NgModule({
  providers: [DOMService]
})
export class IgoDOMModule {
  static forRoot(): ModuleWithProviders<IgoDOMModule> {
    return {
      ngModule: IgoDOMModule,
      providers: [
        DOMService
      ]
    };
  }
}
