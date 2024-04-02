import { ModuleWithProviders, NgModule } from '@angular/core';

import { DownloadButtonComponent } from './download-button/download-button.component';

/**
 * @deprecated import the DownloadButtonComponent directly
 */
@NgModule({
  imports: [DownloadButtonComponent],
  exports: [DownloadButtonComponent]
})
export class IgoDownloadModule {
  static forRoot(): ModuleWithProviders<IgoDownloadModule> {
    return {
      ngModule: IgoDownloadModule
    };
  }
}
