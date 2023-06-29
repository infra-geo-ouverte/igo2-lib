import { NgModule, ModuleWithProviders } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

import { IgoLanguageModule } from '@igo2/core';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog.service';

@NgModule({
  imports: [MatButtonModule, MatDialogModule, IgoLanguageModule],
  declarations: [ConfirmDialogComponent],
  exports: [ConfirmDialogComponent],
  providers: [ConfirmDialogService]
})
export class IgoConfirmDialogModule {
  static forRoot(): ModuleWithProviders<IgoConfirmDialogModule> {
    return {
      ngModule: IgoConfirmDialogModule,
      providers: []
    };
  }
}
