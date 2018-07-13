import { NgModule, ModuleWithProviders } from '@angular/core';
import { DownloadService } from './shared/download.service';

@NgModule({
  imports: [],
  exports: [],
  declarations: []
})
export class IgoDownloadModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoDownloadModule
    };
  }
}
