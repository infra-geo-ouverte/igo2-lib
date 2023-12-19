import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { IgoKeyValueModule } from '../keyvalue/keyvalue.module';
import { JsonDialogComponent } from './json-dialog.component';
import { JsonDialogService } from './json-dialog.service';

@NgModule({
    imports: [CommonModule, MatButtonModule, MatDialogModule, IgoKeyValueModule, JsonDialogComponent],
    exports: [JsonDialogComponent],
    providers: [JsonDialogService]
})
export class IgoJsonDialogModule {
  static forRoot(): ModuleWithProviders<IgoJsonDialogModule> {
    return {
      ngModule: IgoJsonDialogModule
    };
  }
}
