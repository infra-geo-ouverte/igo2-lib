import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { IgoLanguageModule } from '@igo2/core';

import { IgoCustomHtmlModule } from '../custom-html/custom-html.module';
import { IgoFormModule } from '../form/form.module';
import { FormDialogComponent } from './form-dialog.component';
import { FormDialogService } from './form-dialog.service';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        IgoCustomHtmlModule,
        IgoLanguageModule,
        IgoFormModule,
        MatDividerModule,
        FormDialogComponent
    ],
    exports: [FormDialogComponent],
    providers: [FormDialogService]
})
export class IgoFormDialogModule {
  static forRoot(): ModuleWithProviders<IgoFormDialogModule> {
    return {
      ngModule: IgoFormDialogModule,
      providers: []
    };
  }
}
