import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'igo-poi-dialog',
  templateUrl: './poi-dialog.component.html',
})
export class PoiDialogComponent {

  public title: string;

  constructor(public dialogRef: MdDialogRef<PoiDialogComponent>) {}
}
