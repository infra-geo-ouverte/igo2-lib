import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { DownloadService } from './shared';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [],
  declarations: []
})
export class IgoDownloadModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoDownloadModule,
      providers: [
        DownloadService
      ]
    };
  }
}
