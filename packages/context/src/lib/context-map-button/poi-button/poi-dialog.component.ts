import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'igo-poi-dialog',
  templateUrl: './poi-dialog.component.html'
})
export class PoiDialogComponent {
  public title: string;

  constructor(public dialogRef: MatDialogRef<PoiDialogComponent>) {}
}
