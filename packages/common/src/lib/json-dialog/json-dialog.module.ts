import { ModuleWithProviders, NgModule } from '@angular/core';

import { JsonDialogComponent } from './json-dialog.component';
import { JsonDialogService } from './json-dialog.service';

@NgModule({
  imports: [JsonDialogComponent],
  exports: [JsonDialogComponent],
  providers: [JsonDialogService]
})
export class IgoJsonDialogModule {
  /**
   * @deprecated it has no effect
   */
  static forRoot(): ModuleWithProviders<IgoJsonDialogModule> {
    return {
      ngModule: IgoJsonDialogModule
    };
  }
}
