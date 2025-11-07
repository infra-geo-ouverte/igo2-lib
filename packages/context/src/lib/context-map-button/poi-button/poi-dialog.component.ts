import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { IgoLanguageModule } from '@igo2/core/language';

@Component({
  selector: 'igo-poi-dialog',
  templateUrl: './poi-dialog.component.html',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogActions,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class PoiDialogComponent {
  dialogRef = inject<MatDialogRef<PoiDialogComponent>>(MatDialogRef);

  public title: string;
}
