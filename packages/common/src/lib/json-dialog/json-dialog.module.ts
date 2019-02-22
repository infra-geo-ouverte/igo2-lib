import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule } from '@angular/material';

import { IgoKeyValueModule } from '../keyvalue/keyvalue.module';

import { JsonDialogComponent } from './json-dialog.component';
import { JsonDialogService } from './json-dialog.service';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatDialogModule, IgoKeyValueModule],
  exports: [JsonDialogComponent],
  declarations: [JsonDialogComponent],
  entryComponents: [JsonDialogComponent],
  providers: [JsonDialogService]
})
export class IgoJsonDialogModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoJsonDialogModule
    };
  }
}
