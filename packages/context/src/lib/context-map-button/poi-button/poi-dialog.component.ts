import { Component } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'igo-poi-dialog',
    templateUrl: './poi-dialog.component.html',
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatFormFieldModule, MatInputModule, FormsModule, MatDialogActions, MatButtonModule, TranslateModule]
})
export class PoiDialogComponent {
  public title: string;

  constructor(public dialogRef: MatDialogRef<PoiDialogComponent>) {}
}
