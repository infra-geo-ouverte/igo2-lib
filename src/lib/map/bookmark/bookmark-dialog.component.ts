import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'igo-bookmark-dialog',
  templateUrl: './bookmark-dialog.component.html',
})
export class BookmarkDialogComponent {

  public title: string;

  constructor(public dialogRef: MdDialogRef<BookmarkDialogComponent>) {}
}
