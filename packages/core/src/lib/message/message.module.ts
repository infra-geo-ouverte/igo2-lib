import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { GlobalConfig, ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    CommonModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      timeOut: 10000,
      extendedTimeOut: 10000,
      titleClass: 'mat-subtitle-2',
      messageClass: 'toast-message',
      closeButton: true,
      progressBar: true,
      enableHtml: true,
      tapToDismiss: true,
      maxOpened: 4,
      preventDuplicates: true,
      resetTimeoutOnDuplicate: true,
      countDuplicates: false,
      includeTitleDuplicates: true
    } as GlobalConfig)
  ],
  declarations: [],
  exports: []
})
export class IgoMessageModule {
  static forRoot(): ModuleWithProviders<IgoMessageModule> {
    return {
      ngModule: IgoMessageModule,
      providers: []
    };
  }
}
