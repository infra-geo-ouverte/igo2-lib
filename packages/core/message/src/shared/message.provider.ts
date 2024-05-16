import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { GlobalConfig, provideToastr } from 'ngx-toastr';

const TOASTR_CONFIG: Partial<GlobalConfig> = {
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
};

export function provideMessage(): EnvironmentProviders {
  return makeEnvironmentProviders([provideToastr(TOASTR_CONFIG)]);
}
