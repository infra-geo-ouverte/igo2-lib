import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { IgoLanguageModule } from '@igo2/core';

import { TableComponent } from './table.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CdkTableModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatSortModule,
        MatCheckboxModule,
        IgoLanguageModule,
        TableComponent
    ],
    exports: [TableComponent]
})
export class IgoTableModule {
  static forRoot(): ModuleWithProviders<IgoTableModule> {
    return {
      ngModule: IgoTableModule,
      providers: []
    };
  }
}
