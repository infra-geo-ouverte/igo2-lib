import { NgModule, ModuleWithProviders } from '@angular/core';

import { MediaService } from './media';
import { MessageService } from './message';
import { RequestService } from './request';


@NgModule({
  imports: [],
  exports: [],
})
export class IgoCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCoreModule,
      providers: [
        MediaService,
        MessageService,
        RequestService
      ]
    };
  }
}

export * from './media';
export * from './message';
export * from './request';
