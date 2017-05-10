import { NgModule, ModuleWithProviders } from '@angular/core';

import { ActivityService } from './activity';
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
        ActivityService,
        MediaService,
        MessageService,
        RequestService
      ]
    };
  }
}
