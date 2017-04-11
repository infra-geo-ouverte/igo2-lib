import { NgModule, ModuleWithProviders } from '@angular/core';

import { RequestService } from './request';
import { MessageService } from './message';


@NgModule({
  imports: [],
  exports: [],
})
export class IgoCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCoreModule,
      providers: [
        MessageService,
        RequestService
      ]
    };
  }
}

export * from './request';
export * from './message';
